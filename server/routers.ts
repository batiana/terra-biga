import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { getDb } from "./db";
import { eq, sql, desc, and } from "drizzle-orm";
import {
  products, groups, orders, identities, cagnottes, cagnotteUpdates,
  contributions, donations, payments, users, notifications
} from "../drizzle/schema";
import { nanoid } from "nanoid";
import { storagePut } from "./storage";
import { createInvoice, confirmInvoice } from "./services/ligdicash";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 50);
  return `${base}-${nanoid(4).toLowerCase()}`;
}

const FRONTEND = process.env.FRONTEND_URL ?? "http://localhost:3000";
const BACKEND  = process.env.BACKEND_URL  ?? "http://localhost:3000";

// ─── Router ──────────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Products ────────────────────────────────────────────────────
  products: router({
    list: publicProcedure
      .input(z.object({ category: z.string().optional() }).optional())
      .query(async ({ input }) => db.getActiveProducts(input?.category)),
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => db.getProductBySlug(input.slug)),
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => db.getProductById(input.id)),
  }),

  // ─── Groups ──────────────────────────────────────────────────────
  groups: router({
    list: publicProcedure
      .input(z.object({ productId: z.number().optional() }).optional())
      .query(async ({ input }) => db.getActiveGroups(input?.productId)),
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => db.getGroupById(input.id)),
  }),

  // ─── Orders ──────────────────────────────────────────────────────
  orders: router({
    create: publicProcedure
      .input(z.object({
        groupId: z.number(),
        productId: z.number(),
        customerPhone: z.string().min(8),
        customerName: z.string().optional(),
        paymentMethod: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const product = await db.getProductById(input.productId);
        if (!product) throw new Error("Produit introuvable");

        const group = await db.getGroupById(input.groupId);
        // FIX: statut "open" (corrige "forming")
        if (!group || group.status !== "open") throw new Error("Groupe non disponible");

        const orderCode = `TB-${nanoid(5).toUpperCase()}`;
        const advanceAmount = Math.round(product.groupPrice * 0.1);
        const remainingAmount = product.groupPrice - advanceAmount;

        const result = await db.createOrder({
          userId: ctx.user?.id,
          groupId: input.groupId,
          productId: input.productId,
          orderCode,
          advanceAmount,
          remainingAmount,
          totalAmount: product.groupPrice,
          customerPhone: input.customerPhone,
          customerName: input.customerName,
        });

        await db.incrementGroupMembers(input.groupId);

        return { orderCode, advanceAmount, remainingAmount, totalAmount: product.groupPrice, id: result?.id };
      }),
    byCode: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => db.getOrderByCode(input.code)),
    myOrders: protectedProcedure.query(async ({ ctx }) => db.getUserOrders(ctx.user.id)),
  }),

  // ─── Identity ────────────────────────────────────────────────────
  identity: router({
    submit: publicProcedure
      .input(z.object({
        orderId: z.number().optional(),
        fullName: z.string().min(2),
        firstName: z.string().optional(),
        documentType: z.enum(["cni", "passport", "permit"]),
        documentNumber: z.string().min(3),
        phone: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.createIdentity({ userId: ctx.user?.id, ...input });
      }),
  }),

  // ─── Cagnottes ───────────────────────────────────────────────────
  cagnottes: router({
    list: publicProcedure.query(async () => db.getActiveCagnottes()),
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => db.getCagnotteById(input.id)),
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => db.getCagnotteBySlug(input.slug)),

    create: publicProcedure
      .input(z.object({
        title: z.string().min(3).max(60),
        description: z.string().optional(),
        category: z.string(),
        carrierType: z.string().optional(),
        targetAmount: z.number().min(0).optional(),   // FIX: optionnel
        mobileMoneyNumber: z.string().optional(),
        creatorPhone: z.string().optional(),
        creatorName: z.string().optional(),
        healthData: z.any().optional(),
        ngoData: z.any().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user?.id;
        const FREE_QUOTA = 3;
        const FEE_AMOUNT = 500;

        // ── Logique freemium ─────────────────────────────────────────
        if (userId) {
          const existingCount = await db.countUserCagnottes(userId);
          if (existingCount >= FREE_QUOTA) {
            const storeRef = `CAGNOTTE-FEE-${userId}-${Date.now()}`;
            const invoice = await createInvoice({
              storeReference: storeRef,
              amount: FEE_AMOUNT,
              description: "Frais de création cagnotte Terra Biga (500 FCFA)",
              customerPhone: ctx.user?.phone ?? input.creatorPhone ?? "",
              customerFirstName: ctx.user?.firstName ?? undefined,
              customerLastName: ctx.user?.lastName ?? undefined,
              returnUrl: `${FRONTEND}/ma-cagnotte/creer?fee_paid=1&ref=${storeRef}`,
              cancelUrl: `${FRONTEND}/ma-cagnotte/creer?fee_cancelled=1`,
              errorUrl:  `${FRONTEND}/ma-cagnotte/creer?fee_error=1`,
            });
            if (!invoice.success) throw new Error(`Impossible d'initier le paiement : ${invoice.message}`);
            return {
              requiresPayment: true as const,
              feeAmount: FEE_AMOUNT,
              redirectUrl: invoice.redirectUrl,
              ligdicashToken: invoice.token,
              storeReference: storeRef,
            };
          }
        }

        const slug = generateSlug(input.title);
        const needsReview = ["sante", "association_ong"].includes(input.category);
        const result = await db.createCagnotte({
          userId,
          slug,
          ...input,
          targetAmount: input.targetAmount ?? null,
          status: needsReview ? "pending_review" : "active",
        });
        return { requiresPayment: false as const, cagnotte: result, slug };
      }),

    // Création après paiement des frais 500 FCFA
    createAfterFee: publicProcedure
      .input(z.object({
        ligdicashToken: z.string(),
        title: z.string().min(3).max(60),
        description: z.string().optional(),
        category: z.string(),
        carrierType: z.string().optional(),
        targetAmount: z.number().min(0).optional(),
        mobileMoneyNumber: z.string().optional(),
        creatorPhone: z.string().optional(),
        creatorName: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Double vérification Ligdicash
        const status = await confirmInvoice(input.ligdicashToken);
        if (!status.success || status.status !== "completed") {
          throw new Error(`Paiement non confirmé (${status.status}). Réessayer ou contacter le support.`);
        }
        const slug = generateSlug(input.title);
        const needsReview = ["sante", "association_ong"].includes(input.category);
        const { ligdicashToken, ...rest } = input;
        const result = await db.createCagnotte({
          userId: ctx.user?.id,
          slug,
          ...rest,
          targetAmount: input.targetAmount ?? null,
          status: needsReview ? "pending_review" : "active",
          feesPaidAt: new Date(),
          feePaymentToken: ligdicashToken,
        });
        return { cagnotte: result, slug };
      }),

    contributions: publicProcedure
      .input(z.object({ cagnotteId: z.number() }))
      .query(async ({ input }) => db.getCagnotteContributions(input.cagnotteId)),

    // ← NEW — Dashboard porteur
    mine: protectedProcedure
      .query(async ({ ctx }) => {
        const database = await getDb();
        if (!database) return [];
        return database
          .select()
          .from(cagnottes)
          .where(eq(cagnottes.userId, ctx.user.id))
          .orderBy(desc(cagnottes.createdAt));
      }),

    pause: protectedProcedure
      .input(z.object({ cagnotteId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new Error("DB_UNAVAILABLE");
        const cagnotte = await db.getCagnotteById(input.cagnotteId);
        if (!cagnotte || cagnotte.userId !== ctx.user.id) throw new Error("UNAUTHORIZED");
        await database.update(cagnottes).set({ isPaused: true, status: "paused" }).where(eq(cagnottes.id, input.cagnotteId));
        return { success: true };
      }),

    resume: protectedProcedure
      .input(z.object({ cagnotteId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new Error("DB_UNAVAILABLE");
        const cagnotte = await db.getCagnotteById(input.cagnotteId);
        if (!cagnotte || cagnotte.userId !== ctx.user.id) throw new Error("UNAUTHORIZED");
        await database.update(cagnottes).set({ isPaused: false, status: "active" }).where(eq(cagnottes.id, input.cagnotteId));
        return { success: true };
      }),

    close: protectedProcedure
      .input(z.object({ cagnotteId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new Error("DB_UNAVAILABLE");
        const cagnotte = await db.getCagnotteById(input.cagnotteId);
        if (!cagnotte || cagnotte.userId !== ctx.user.id) throw new Error("UNAUTHORIZED");
        await database.update(cagnottes).set({ status: "completed" }).where(eq(cagnottes.id, input.cagnotteId));
        return { success: true };
      }),

    updates: protectedProcedure
      .input(z.object({ cagnotteId: z.number() }))
      .query(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) return [];
        const cagnotte = await db.getCagnotteById(input.cagnotteId);
        if (!cagnotte || cagnotte.userId !== ctx.user.id) throw new Error("UNAUTHORIZED");
        return database
          .select()
          .from(cagnotteUpdates)
          .where(eq(cagnotteUpdates.cagnotteId, input.cagnotteId))
          .orderBy(desc(cagnotteUpdates.createdAt));
      }),

    publishUpdate: protectedProcedure
      .input(z.object({ cagnotteId: z.number(), content: z.string().min(1).max(500), imageUrl: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new Error("DB_UNAVAILABLE");
        const cagnotte = await db.getCagnotteById(input.cagnotteId);
        if (!cagnotte || cagnotte.userId !== ctx.user.id) throw new Error("UNAUTHORIZED");
        await database.insert(cagnotteUpdates).values({
          cagnotteId: input.cagnotteId,
          userId: ctx.user.id,
          content: input.content,
          imageUrl: input.imageUrl,
        });
        return { success: true };
      }),
  }),

  // ─── Contributions ──────────────────────────────────────────────
  contributions: router({
    create: publicProcedure
      .input(z.object({
        cagnotteId: z.number(),
        contributorName: z.string().optional(),
        contributorPhone: z.string().min(8),
        amount: z.number().min(100).max(5_000_000),
        message: z.string().max(140).optional(),
        paymentMethod: z.string().optional(),
        isAnonymous: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Crée la contribution en statut "pending" — confirmée par webhook
        return db.createContribution({ userId: ctx.user?.id, ...input });
      }),
  }),

  // ─── Donations ──────────────────────────────────────────────────
  donations: router({
    create: publicProcedure
      .input(z.object({
        donorName: z.string().optional(),
        donorPhone: z.string().min(8),
        amount: z.number().min(100),
        paymentMethod: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => db.createDonation({ userId: ctx.user?.id, ...input })),
    list: publicProcedure.query(async () => db.getAllDonations()),
  }),

  // ─── Points ─────────────────────────────────────────────────────
  points: router({
    history: protectedProcedure.query(async ({ ctx }) => db.getUserPointHistory(ctx.user.id)),
  }),

  // ─── Payments ───────────────────────────────────────────────────
  payments: router({
    /**
     * FIX CRITIQUE : initie un vrai paiement Ligdicash (plus de simulation SIM-XXXXX).
     * Retourne une redirectUrl vers Ligdicash, ou des instructions USSD.
     */
    initiate: publicProcedure
      .input(z.object({
        type: z.enum(["advance", "remaining", "contribution", "donation"]),
        referenceId: z.number().optional(),
        amount: z.number().min(100).max(5_000_000),
        method: z.enum(["ussd_orange", "ussd_moov", "ligidicash"]),
        phone: z.string().min(8),
        customerName: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const payment = await db.createPayment({
          type: input.type as "advance" | "remaining" | "contribution" | "donation",
          referenceId: input.referenceId,
          amount: input.amount,
          method: input.method,
          phone: input.phone,
        });
        if (!payment) throw new Error("Erreur lors de la création du paiement");

        const storeRef = `TB-${input.type.toUpperCase()}-${payment.id}-${Date.now()}`;

        // ── Méthodes USSD ─────────────────────────────────────────
        if (input.method !== "ligidicash") {
          const ussdMap: Record<string, string> = {
            ussd_orange: `Composez *144*2*1*${input.phone}*${input.amount}# et validez. Réf: ${storeRef}`,
            ussd_moov:   `Composez *155*1*${input.phone}*${input.amount}# et validez. Réf: ${storeRef}`,
          };
          return {
            paymentId: payment.id,
            method: input.method,
            status: "pending" as const,
            ussdInstruction: ussdMap[input.method] ?? "",
            storeReference: storeRef,
            redirectUrl: null,
            ligdicashToken: null,
          };
        }

        // ── Ligdicash redirect ─────────────────────────────────────
        const descriptions: Record<string, string> = {
          advance:      `Te Raga — Dépôt 10% (réf ${storeRef})`,
          remaining:    `Te Raga — Solde 90% (réf ${storeRef})`,
          contribution: `Mam Cagnotte — Contribution (réf ${storeRef})`,
          donation:     `Don Biga Connect (${input.amount} FCFA)`,
          fee_cagnotte: `Frais création cagnotte Terra Biga (500 FCFA)`,
        };

        const returnBase = input.type === "advance" || input.type === "remaining"
          ? `${FRONTEND}/te-raga/confirmation`
          : `${FRONTEND}/ma-cagnotte`;

        const invoice = await createInvoice({
          storeReference: storeRef,
          amount: input.amount,
          description: input.description ?? descriptions[input.type],
          customerPhone: input.phone,
          customerFirstName: input.customerName?.split(" ")[0],
          customerLastName: input.customerName?.split(" ").slice(1).join(" "),
          returnUrl:  `${returnBase}?paymentId=${payment.id}&status=success`,
          cancelUrl:  `${FRONTEND}/te-raga/paiement?error=cancelled`,
          errorUrl:   `${FRONTEND}/te-raga/paiement?error=failed`,
        });

        if (!invoice.success) {
          const dbInst = await getDb();
          if (dbInst) await dbInst.update(payments).set({ status: "failed" }).where(eq(payments.id, payment.id));
          throw new Error(`Ligdicash: ${invoice.message}`);
        }

        // Stocker le token pour reconciliation webhook
        const dbInst = await getDb();
        if (dbInst) {
          await dbInst.update(payments)
            .set({ ligdicashToken: invoice.token })
            .where(eq(payments.id, payment.id));
        }

        return {
          paymentId: payment.id,
          method: "ligidicash" as const,
          status: "pending" as const,
          redirectUrl: invoice.redirectUrl,
          ligdicashToken: invoice.token,
          storeReference: storeRef,
          ussdInstruction: null,
        };
      }),

    // Vérification polling (page de retour)
    verify: publicProcedure
      .input(z.object({ paymentId: z.number() }))
      .query(async ({ input }) => {
        const dbInst = await getDb();
        if (!dbInst) throw new Error("BDD indisponible");
        const [payment] = await dbInst.select().from(payments).where(eq(payments.id, input.paymentId)).limit(1);
        if (!payment) throw new Error("Paiement introuvable");
        if (payment.status === "completed") return { status: "completed", payment };

        if (payment.ligdicashToken) {
          const verified = await confirmInvoice(payment.ligdicashToken);
          if (verified.success && verified.status === "completed") {
            await dbInst.update(payments)
              .set({ status: "completed", providerTransactionId: verified.transactionId })
              .where(and(eq(payments.id, payment.id), eq(payments.status, "pending")));
            return { status: "completed", transactionId: verified.transactionId };
          }
        }
        return { status: payment.status };
      }),
  }),

  // ─── Admin ──────────────────────────────────────────────────────
  admin: router({
    stats: adminProcedure.query(async () => db.getAdminStats()),
    orders: adminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }).optional())
      .query(async ({ input }) => db.getAllOrders(input?.limit, input?.offset)),
    updateOrderStatus: adminProcedure
      .input(z.object({
        orderId: z.number(),
        collectionStatus: z.enum(["waiting", "ready", "collected"]).optional(),
        paymentStatus: z.enum(["pending", "advance_paid", "fully_paid", "failed"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const dbInst = await getDb();
        if (!dbInst) return;
        const updateData: Record<string, any> = {};
        if (input.collectionStatus) updateData.collectionStatus = input.collectionStatus;
        if (input.paymentStatus)    updateData.paymentStatus    = input.paymentStatus;
        await dbInst.update(orders).set(updateData).where(eq(orders.id, input.orderId));
        return { success: true };
      }),
    updateGroupStatus: adminProcedure
      .input(z.object({
        groupId: z.number(),
        status: z.enum(["open", "full", "balance_pending", "ordered", "delivered", "completed"]),
      }))
      .mutation(async ({ input }) => {
        const dbInst = await getDb();
        if (!dbInst) return;
        await dbInst.update(groups).set({ status: input.status }).where(eq(groups.id, input.groupId));
        return { success: true };
      }),
    cagnottes: adminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }).optional())
      .query(async ({ input }) => db.getAllCagnottes(input?.limit, input?.offset)),
    approveCagnotte: adminProcedure
      .input(z.object({ cagnotteId: z.number() }))
      .mutation(async ({ input }) => {
        const dbInst = await getDb();
        if (!dbInst) return;
        await dbInst.update(cagnottes).set({ status: "active" }).where(eq(cagnottes.id, input.cagnotteId));
        return { success: true };
      }),
    rejectCagnotte: adminProcedure
      .input(z.object({ cagnotteId: z.number(), reason: z.string() }))
      .mutation(async ({ input }) => {
        const dbInst = await getDb();
        if (!dbInst) return;
        await dbInst.update(cagnottes).set({ status: "rejected", rejectionReason: input.reason }).where(eq(cagnottes.id, input.cagnotteId));
        return { success: true };
      }),
    identities: adminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }).optional())
      .query(async ({ input }) => db.getAllIdentities(input?.limit, input?.offset)),
    verifyIdentity: adminProcedure
      .input(z.object({ identityId: z.number(), status: z.enum(["verified", "rejected"]) }))
      .mutation(async ({ input }) => {
        const dbInst = await getDb();
        if (!dbInst) return;
        await dbInst.update(identities).set({ status: input.status }).where(eq(identities.id, input.identityId));
        return { success: true };
      }),
    payments: adminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }).optional())
      .query(async ({ input }) => db.getAllPayments(input?.limit, input?.offset)),
    users: adminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }).optional())
      .query(async ({ input }) => db.getAllUsers(input?.limit, input?.offset)),
    donations: adminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }).optional())
      .query(async ({ input }) => db.getAllDonations(input?.limit, input?.offset)),
    adjustPoints: adminProcedure
      .input(z.object({ userId: z.number(), points: z.number(), description: z.string() }))
      .mutation(async ({ input }) => {
        await db.addPointTransaction({ userId: input.userId, action: "admin_adjustment", points: input.points, description: input.description });
        return { success: true };
      }),
    proposals: adminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }).optional())
      .query(async ({ input }) => {
        const dbInst = await getDb();
        if (!dbInst) return [];
        return dbInst.select().from(groups).where(eq(groups.status, "open")).limit(input?.limit ?? 50).offset(input?.offset ?? 0);
      }),
    organizations: adminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }).optional())
      .query(async ({ input }) => {
        const dbInst = await getDb();
        if (!dbInst) return [];
        return dbInst.select().from(cagnottes).where(eq(cagnottes.category, "association_ong")).limit(input?.limit ?? 50).offset(input?.offset ?? 0);
      }),
    projects: adminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }).optional())
      .query(async ({ input }) => {
        const dbInst = await getDb();
        if (!dbInst) return [];
        return dbInst.select().from(cagnottes).where(eq(cagnottes.category, "projet")).limit(input?.limit ?? 50).offset(input?.offset ?? 0);
      }),
    projectById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const dbInst = await getDb();
        if (!dbInst) return null;
        const result = await dbInst.select().from(cagnottes).where(eq(cagnottes.id, input.id));
        return result[0] || null;
      }),
    approveProject: adminProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ input }) => {
        const dbInst = await getDb();
        if (!dbInst) return;
        await dbInst.update(cagnottes).set({ status: "active" }).where(eq(cagnottes.id, input.projectId));
        return { success: true };
      }),
    rejectProject: adminProcedure
      .input(z.object({ projectId: z.number(), reason: z.string() }))
      .mutation(async ({ input }) => {
        const dbInst = await getDb();
        if (!dbInst) return;
        await dbInst.update(cagnottes).set({ status: "rejected", rejectionReason: input.reason }).where(eq(cagnottes.id, input.projectId));
        return { success: true };
      }),
  }),

  // ─── Cagnottes Extended ──────────────────────────────────────────
  cagnottes: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().default(10), offset: z.number().default(0) }).optional())
      .query(async ({ input }) => {
        const dbInst = await getDb();
        if (!dbInst) return [];
        return dbInst.select().from(cagnottes).where(eq(cagnottes.status, "active")).limit(input?.limit ?? 10).offset(input?.offset ?? 0);
      }),
    mine: protectedProcedure
      .query(async ({ ctx }) => {
        const dbInst = await getDb();
        if (!dbInst || !ctx.user) return [];
        return dbInst.select().from(cagnottes).where(eq(cagnottes.userId, ctx.user.id));
      }),
    pause: protectedProcedure
      .input(z.object({ cagnotteId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const dbInst = await getDb();
        if (!dbInst || !ctx.user) return;
        await dbInst.update(cagnottes).set({ isPaused: true }).where(and(eq(cagnottes.id, input.cagnotteId), eq(cagnottes.userId, ctx.user.id)));
        return { success: true };
      }),
    resume: protectedProcedure
      .input(z.object({ cagnotteId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const dbInst = await getDb();
        if (!dbInst || !ctx.user) return;
        await dbInst.update(cagnottes).set({ isPaused: false }).where(and(eq(cagnottes.id, input.cagnotteId), eq(cagnottes.userId, ctx.user.id)));
        return { success: true };
      }),
    close: protectedProcedure
      .input(z.object({ cagnotteId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const dbInst = await getDb();
        if (!dbInst || !ctx.user) return;
        await dbInst.update(cagnottes).set({ status: "completed" }).where(and(eq(cagnottes.id, input.cagnotteId), eq(cagnottes.userId, ctx.user.id)));
        return { success: true };
      }),
    updates: protectedProcedure
      .input(z.object({ cagnotteId: z.number() }))
      .query(async ({ input }) => {
        const dbInst = await getDb();
        if (!dbInst) return [];
        return dbInst.select().from(cagnotteUpdates).where(eq(cagnotteUpdates.cagnotteId, input.cagnotteId)).orderBy(desc(cagnotteUpdates.createdAt));
      }),
    publishUpdate: protectedProcedure
      .input(z.object({ cagnotteId: z.number(), title: z.string(), content: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const dbInst = await getDb();
        if (!dbInst || !ctx.user) return;
        const result = await dbInst.insert(cagnotteUpdates).values({ cagnotteId: input.cagnotteId, title: input.title, content: input.content });
        return { success: true, updateId: result.insertId };
      }),
  }),

  // ─── Contributions ──────────────────────────────────────────────────
  contributions: router({
    mine: protectedProcedure
      .query(async ({ ctx }) => {
        const dbInst = await getDb();
        if (!dbInst || !ctx.user) return [];
        return dbInst.select().from(contributions).where(eq(contributions.contributorId, ctx.user.id));
      }),
  }),

  // ─── Groups Extended ─────────────────────────────────────────────
  groups: router({
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const dbInst = await getDb();
        if (!dbInst) return null;
        const result = await dbInst.select().from(groups).where(eq(groups.id, input.id));
        return result[0] || null;
      }),
    propose: protectedProcedure
      .input(z.object({
        productId: z.number(),
        groupName: z.string(),
        targetMembers: z.number(),
        deadline: z.date(),
        description: z.string().optional(),
        contactPhone: z.string(),
        contactName: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const dbInst = await getDb();
        if (!dbInst || !ctx.user) return;
        const result = await dbInst.insert(groups).values({
          productId: input.productId,
          name: input.groupName,
          targetMembers: input.targetMembers,
          deadline: input.deadline,
          description: input.description,
          createdBy: ctx.user.id,
          status: "open",
        });
        return { success: true, groupId: result.insertId };
      }),
    join: protectedProcedure
      .input(z.object({ groupId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const dbInst = await getDb();
        if (!dbInst || !ctx.user) return;
        const result = await dbInst.insert(orders).values({
          groupId: input.groupId,
          userId: ctx.user.id,
          collectionStatus: "waiting",
          paymentStatus: "pending",
        });
        return { success: true, orderId: result.insertId };
      }),
  }),
});

export type AppRouter = typeof appRouter;

export type AppRouter = typeof appRouter;
