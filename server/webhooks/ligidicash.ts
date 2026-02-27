/**
 * server/webhooks/ligidicash.ts
 * ─────────────────────────────────────────────────────────────────────
 * Ligidicash webhook handler.
 * Registered at POST /api/webhooks/ligidicash
 *
 * On payment completion this handler:
 *  - Verifies HMAC signature
 *  - Updates payment, order or cagnotte record in DB  (idempotent)
 *  - Awards BIGA points
 *
 * FIX: suppression de freemiumPayments (table inexistante) et
 *      payment.metadata (colonne ajoutée en schema V3.3 — disponible)
 */

import type { Express, Request, Response } from "express";
import { eq, and, sql } from "drizzle-orm";
import { getDb } from "../db";
import {
  payments, orders, cagnottes, contributions,
} from "../../drizzle/schema";
import {
  verifyWebhookSignature,
  mapStatus,
  type LigidicashWebhookPayload,
} from "../services/ligidicash";
import * as db from "../db";
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
  app.post(
    "/api/webhooks/ligidicash",
    async (req: Request, res: Response) => {
      // ─── 1. Signature verification ──────────────────────────────
      const sigHeader =
        (req.headers["x-ligidicash-signature"] as string) ??
        (req.headers["x-signature"] as string) ??
        "";

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

      console.log(
        `[LigidicashWebhook] TX=${payload.transaction_id} ref=${payload.reference} status=${status}`
      );

      const database = await getDb();
      if (!database) {
        res.status(503).json({ error: "db_unavailable" });
        return;
      }

      // ─── 3. Find matching payment by providerTransactionId ───────
      const [payment] = await database
        .select()
        .from(payments)
        .where(eq(payments.providerTransactionId, payload.transaction_id))
        .limit(1);

      if (!payment) {
        console.warn(
          `[LigidicashWebhook] No payment found for TX ${payload.transaction_id}`
        );
        res.status(200).json({ received: true });
        return;
      }

      // ─── 4. Idempotency guard ────────────────────────────────────
      if (payment.status === "completed" || payment.status === "failed") {
        res.status(200).json({ received: true, already_processed: true });
        return;
      }

      // ─── 5. Update payment status ────────────────────────────────
      await database
        .update(payments)
        .set({ status: status === "completed" ? "completed" : "failed" })
        .where(eq(payments.id, payment.id));

      if (status !== "completed") {
        res.status(200).json({ received: true });
        return;
      }

      // ─── 6. Handle by payment type ───────────────────────────────
      try {
        await handleCompletedPayment(payment, payload, database);
      } catch (err) {
        console.error("[LigidicashWebhook] Error handling completed payment:", err);
        // Return 200 anyway to prevent Ligidicash from retrying endlessly
      }

      res.status(200).json({ received: true });
    }
  );
}

// ─── Payment type handlers ────────────────────────────────────────────
async function handleCompletedPayment(
  payment: typeof payments.$inferSelect,
  payload: LigidicashWebhookPayload,
  database: NonNullable<Awaited<ReturnType<typeof getDb>>>
): Promise<void> {
  // FIX: metadata est maintenant une colonne JSON dans payments — cast sûr
  const meta = (payment.metadata as Record<string, unknown> | null) ?? {};

  switch (payment.type) {
    // ─── Te Raga — avance 10% ────────────────────────────────────
    case "advance": {
      if (!payment.referenceId) break;
      await database
        .update(orders)
        .set({ paymentStatus: "advance_paid" })
        .where(eq(orders.id, payment.referenceId));

      const [order] = await database
        .select()
        .from(orders)
        .where(eq(orders.id, payment.referenceId))
        .limit(1);
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

    // ─── Te Raga — solde 90% ─────────────────────────────────────
    case "remaining": {
      if (!payment.referenceId) break;
      await database
        .update(orders)
        .set({ paymentStatus: "fully_paid" })
        .where(eq(orders.id, payment.referenceId));

      const [order] = await database
        .select()
        .from(orders)
        .where(eq(orders.id, payment.referenceId))
        .limit(1);
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

    // ─── Frais création cagnotte 500 FCFA ────────────────────────
    case "fee_cagnotte": {
      // Les données de la cagnotte en attente sont dans metadata.pendingCagnotte
      const cagnotteDataStr = meta.pendingCagnotte as string | undefined;
      if (!cagnotteDataStr) {
        console.warn("[LigidicashWebhook] fee_cagnotte: no pendingCagnotte in metadata");
        break;
      }
      try {
        const cagnotteData = JSON.parse(cagnotteDataStr);
        const slug = generateCagnotteSlug(cagnotteData.title);
        const needsReview = ["sante", "association_ong"].includes(
          cagnotteData.category
        );

        await database.insert(cagnottes).values({
          ...cagnotteData,
          slug,
          feesPaidAt: new Date(),
          feePaymentToken: payment.ligdicashToken ?? undefined,
          status: needsReview ? "pending_review" : "active",
        });

        if (cagnotteData.userId) {
          await db.addPointTransaction({
            userId: cagnotteData.userId,
            action: "cagnotte_created",
            points: 25,
            description: `Cagnotte créée : ${cagnotteData.title}`,
          });
        }
      } catch (parseErr) {
        console.error(
          "[LigidicashWebhook] Failed to create pending cagnotte:",
          parseErr
        );
      }
      break;
    }

    // ─── Contribution cagnotte ────────────────────────────────────
    case "contribution": {
      if (!payment.referenceId) break;

      const [contrib] = await database
        .select()
        .from(contributions)
        .where(eq(contributions.id, payment.referenceId))
        .limit(1);

      if (contrib) {
        await database
          .update(contributions)
          .set({ paymentStatus: "completed" })
          .where(eq(contributions.id, contrib.id));

        await database
          .update(cagnottes)
          .set({
            currentAmount: sql`currentAmount + ${contrib.amount}`,
            contributorsCount: sql`contributorsCount + 1`,
          })
          .where(eq(cagnottes.id, contrib.cagnotteId));

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
