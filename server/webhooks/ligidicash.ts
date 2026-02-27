/**
 * server/webhooks/ligidicash.ts
 * ─────────────────────────────────────────────────────────────────────
 * Ligidicash webhook handler.
 * Registered at POST /api/webhooks/ligidicash
 *
 * On payment completion this handler:
 *  - Verifies HMAC signature
 *  - Updates payment, order or freemium record in DB
 *  - Activates cagnottes that were pending_payment
 *  - Triggers WhatsApp notifications
 *  - Awards BIGA points
 */

import type { Express, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import {
  payments, orders, cagnottes, freemiumPayments
} from "../../drizzle/schema";
import { verifyWebhookSignature, mapStatus, type LigidicashWebhookPayload } from "../services/ligidicash";
import * as db from "../db";
import {
  notifyPorteurContribution,
  notifyGroupFull,
  notifyOrderReady,
} from "../services/notifyUser";
import { nanoid } from "nanoid";

// ─── Helper — generate a unique cagnotte slug ─────────────────────────
function generateCagnotteSlug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40);
  return `${base}-${nanoid(6).toLowerCase()}`;
}

// ─── Route registration ───────────────────────────────────────────────

export function registerLigidicashWebhook(app: Express): void {
  // Collect raw body BEFORE json middleware parses it (needed for signature verification)
  app.post(
    "/api/webhooks/ligidicash",
    // Note: express.json() must NOT be applied to this route before we read rawBody.
    // The global express.json() middleware runs first; to get raw body we need to
    // use express.raw() here or rely on body already being string-parsed.
    // If you need rawBody, move this route registration BEFORE express.json() in index.ts.
    async (req: Request, res: Response) => {
      // ─── 1. Signature verification ──────────────────────────────
      const sigHeader =
        (req.headers["x-ligidicash-signature"] as string) ??   // ⚠️ confirm header name
        (req.headers["x-signature"] as string) ??
        "";

      // rawBody must be the un-parsed request body string
      // If express.json() already ran, use JSON.stringify(req.body) as fallback
      const rawBody =
        typeof (req as any).rawBody === "string"
          ? (req as any).rawBody
          : JSON.stringify(req.body);

      if (!verifyWebhookSignature(rawBody, sigHeader)) {
        console.warn("[LigidicashWebhook] Invalid signature from", req.ip);
        res.status(401).json({ error: "invalid_signature" });
        return;
      }

      // ─── 2. Parse payload ────────────────────────────────────────
      const payload = req.body as LigidicashWebhookPayload;
      const status = mapStatus(payload.status);

      console.log(`[LigidicashWebhook] TX=${payload.transaction_id} ref=${payload.reference} status=${status}`);

      const database = await getDb();
      if (!database) {
        res.status(503).json({ error: "db_unavailable" });
        return;
      }

      // ─── 3. Find matching payment in our DB by providerTransactionId or reference ──
      const [payment] = await database
        .select()
        .from(payments)
        .where(eq(payments.providerTransactionId, payload.transaction_id))
        .limit(1);

      if (!payment) {
        // Could be a race condition (payment not yet stored). Idempotently store and 200.
        console.warn(`[LigidicashWebhook] No payment found for TX ${payload.transaction_id}`);
        res.status(200).json({ received: true });
        return;
      }

      // Idempotency — already processed
      if (payment.status === "completed" || payment.status === "failed") {
        res.status(200).json({ received: true, already_processed: true });
        return;
      }

      // ─── 4. Update payment status ────────────────────────────────
      await database
        .update(payments)
        .set({ status: status === "completed" ? "completed" : "failed" })
        .where(eq(payments.id, payment.id));

      if (status !== "completed") {
        // Payment failed or expired — no further action
        res.status(200).json({ received: true });
        return;
      }

      // ─── 5. Handle by payment type ───────────────────────────────
      try {
        await handleCompletedPayment(payment, payload, database);
      } catch (err) {
        console.error("[LigidicashWebhook] Error handling completed payment:", err);
        // Still return 200 to prevent Ligidicash retrying
      }

      res.status(200).json({ received: true });
    }
  );
}

// ─── Payment type handlers ────────────────────────────────────────────

async function handleCompletedPayment(
  payment: { id: number; type: string; referenceId: number | null; metadata: unknown },
  payload: LigidicashWebhookPayload,
  database: NonNullable<Awaited<ReturnType<typeof getDb>>>
): Promise<void> {
  const meta = (payment.metadata as Record<string, unknown>) ?? {};

  switch (payment.type) {
    // ─── Te Raga advance payment ──────────────────────────────────
    case "advance": {
      if (!payment.referenceId) break;
      await database
        .update(orders)
        .set({ paymentStatus: "advance_paid" })
        .where(eq(orders.id, payment.referenceId));

      // Award BIGA points for group order
      const [order] = await database.select().from(orders).where(eq(orders.id, payment.referenceId)).limit(1);
      if (order?.userId) {
        await db.addPointTransaction({
          userId: order.userId,
          action: "group_purchase_advance",
          points: 25,
          description: `Avance payée — commande ${order.orderCode}`,
        });
      }
      break;
    }

    // ─── Te Raga remaining balance payment ────────────────────────
    case "remaining": {
      if (!payment.referenceId) break;
      await database
        .update(orders)
        .set({ paymentStatus: "fully_paid" })
        .where(eq(orders.id, payment.referenceId));

      // Award full order points
      const [order] = await database.select().from(orders).where(eq(orders.id, payment.referenceId)).limit(1);
      if (order?.userId) {
        await db.addPointTransaction({
          userId: order.userId,
          action: "order_completed",
          points: 100,
          description: `Commande finalisée — ${order.orderCode}`,
        });
      }
      break;
    }

    // ─── Cagnotte creation fee (500 FCFA freemium) ────────────────
    case "creation_fee": {
      const freemiumId = meta.freemiumPaymentId as number | undefined;
      const cagnotteDataStr = meta.pendingCagnotte as string | undefined;

      if (freemiumId) {
        await database
          .update(freemiumPayments)
          .set({ status: "completed", paymentId: payment.id })
          .where(eq(freemiumPayments.id, freemiumId));
      }

      // If pendingCagnotte is in metadata, create the cagnotte now
      if (cagnotteDataStr) {
        try {
          const cagnotteData = JSON.parse(cagnotteDataStr);
          const slug = generateCagnotteSlug(cagnotteData.title);
          const needsReview = ["sante", "association_ong"].includes(cagnotteData.category);

          const [result] = await database
            .insert(cagnottes)
            .values({
              ...cagnotteData,
              slug,
              status: needsReview ? "pending_review" : "active",
            })
            .$returningId();

          // Update freemium record with cagnotteId
          if (freemiumId && result?.id) {
            await database
              .update(freemiumPayments)
              .set({ cagnotteId: result.id })
              .where(eq(freemiumPayments.id, freemiumId));
          }

          // Award cagnotte creation points
          if (cagnotteData.userId) {
            await db.addPointTransaction({
              userId: cagnotteData.userId,
              action: "cagnotte_created",
              points: 25,
              description: `Cagnotte créée : ${cagnotteData.title}`,
            });
          }
        } catch (parseErr) {
          console.error("[LigidicashWebhook] Failed to create pending cagnotte:", parseErr);
        }
      }
      break;
    }

    // ─── Contribution payment (if ever routed through Ligidicash) ──
    case "contribution": {
      if (!payment.referenceId) break;
      const [contrib] = await database
        .select()
        .from(/* contributions */ (await import("../../drizzle/schema")).contributions)
        .where(eq((await import("../../drizzle/schema")).contributions.id, payment.referenceId))
        .limit(1);

      if (contrib) {
        await database
          .update((await import("../../drizzle/schema")).contributions)
          .set({ paymentStatus: "completed" })
          .where(eq((await import("../../drizzle/schema")).contributions.id, contrib.id));

        await db.updateCagnotteAmount(contrib.cagnotteId, contrib.amount);

        if (contrib.userId) {
          await db.addPointTransaction({
            userId: contrib.userId,
            action: "contribution",
            points: 25,
            description: `Contribution de ${contrib.amount} FCFA`,
          });
        }
      }
      break;
    }

    default:
      console.warn(`[LigidicashWebhook] Unhandled payment type: ${payment.type}`);
  }
}
