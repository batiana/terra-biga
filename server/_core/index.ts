import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerChatRoutes } from "./chat";
import { registerOgRoutes } from "../ogRoutes";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { confirmInvoice } from "../services/ligdicash";
import { getDb } from "../db";
import { eq, and } from "drizzle-orm";
import { payments, orders, cagnottes, contributions } from "../../drizzle/schema";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Chat API with streaming and tool calling
  registerChatRoutes(app);
  // Open Graph meta routes for social sharing
  registerOgRoutes(app);

  // ── Webhook Ligdicash ─────────────────────────────────────────────────────
  // ⚠️  TOUJOURS double-vérifier avec confirmInvoice() avant tout effet métier
  // ⚠️  Idempotence : le webhook peut être appelé plusieurs fois pour un même paiement
  app.post("/api/webhooks/ligdicash", async (req, res) => {
    try {
      const { token, response_code, status } = req.body as {
        token?: string;
        response_code?: string;
        status?: string;
      };

      if (!token) {
        console.warn("[Webhook Ligdicash] token manquant dans le body");
        return res.status(400).json({ error: "token manquant" });
      }

      // Double vérification auprès de Ligdicash
      const verified = await confirmInvoice(token);
      if (!verified.success || verified.status !== "completed") {
        console.warn(`[Webhook Ligdicash] paiement non confirmé: ${verified.status}`);
        return res.status(200).json({ received: true, status: "not_completed" });
      }

      const db = await getDb();
      if (!db) return res.status(500).json({ error: "BDD indisponible" });

      // Trouver le paiement par token Ligdicash
      const [payment] = await db.select().from(payments)
        .where(eq((payments as any).ligdicashToken, token))
        .limit(1);

      if (!payment) {
        console.warn(`[Webhook Ligdicash] aucun paiement trouvé pour token ${token}`);
        return res.status(200).json({ received: true, status: "not_found" });
      }

      // Idempotence : ignorer si déjà traité
      if (payment.status === "completed") {
        console.log(`[Webhook Ligdicash] paiement ${payment.id} déjà traité — ignoré`);
        return res.status(200).json({ received: true, status: "already_processed" });
      }

      // Marquer le paiement comme complété
      await db.update(payments)
        .set({ status: "completed", providerTransactionId: verified.transactionId })
        .where(and(eq(payments.id, payment.id), eq(payments.status, "pending")));

      // ── Effets métier selon le type de paiement ───────────────────────────
      if (payment.type === "advance" && payment.referenceId) {
        // Te Raga : dépôt 10% → marquer la commande advance_paid
        await db.update(orders)
          .set({ paymentStatus: "advance_paid" })
          .where(eq(orders.id, payment.referenceId));
        console.log(`[Webhook] Te Raga avance confirmée — commande #${payment.referenceId}`);
      }

      if (payment.type === "remaining" && payment.referenceId) {
        // Te Raga : solde 90% → marquer fully_paid
        await db.update(orders)
          .set({ paymentStatus: "fully_paid" })
          .where(eq(orders.id, payment.referenceId));
        console.log(`[Webhook] Te Raga solde confirmé — commande #${payment.referenceId}`);
      }

      if (payment.type === "contribution" && payment.referenceId) {
        // Mam Cagnotte : mise à jour montant collecté + nb contributeurs
        await db.update(cagnottes).set({
          currentAmount: (db as any).sql`currentAmount + ${payment.amount}`,
          contributorsCount: (db as any).sql`contributorsCount + 1`,
        }).where(eq(cagnottes.id, payment.referenceId));
        // Marquer la contribution comme completed
        await db.update(contributions)
          .set({ paymentStatus: "completed" })
          .where(and(
            eq(contributions.cagnotteId, payment.referenceId),
            eq(contributions.paymentStatus, "pending")
          ));
        console.log(`[Webhook] Contribution confirmée — cagnotte #${payment.referenceId}`);
      }

      console.log(`[Webhook Ligdicash] paiement #${payment.id} traité (${payment.type}, ${payment.amount} FCFA)`);
      return res.status(200).json({ received: true, status: "processed" });

    } catch (err) {
      console.error("[Webhook Ligdicash] erreur:", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  });
  // ─────────────────────────────────────────────────────────────────────────

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
