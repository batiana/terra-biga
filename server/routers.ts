import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { getDb } from "./db";
import { eq, sql, desc } from "drizzle-orm";
import {
  products, groups, orders, identities, cagnottes,
  contributions, donations, payments, users, notifications
} from "../drizzle/schema";
import { nanoid } from "nanoid";
import { storagePut } from "./storage";

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
      .query(async ({ input }) => {
        return db.getActiveProducts(input?.category);
      }),
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return db.getProductBySlug(input.slug);
      }),
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getProductById(input.id);
      }),
  }),

  // ─── Groups ──────────────────────────────────────────────────────
  groups: router({
    list: publicProcedure
      .input(z.object({ productId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getActiveGroups(input?.productId);
      }),
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getGroupById(input.id);
      }),
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
        if (!group || group.status !== "forming") throw new Error("Groupe non disponible");

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
      .query(async ({ input }) => {
        return db.getOrderByCode(input.code);
      }),
    myOrders: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserOrders(ctx.user.id);
    }),
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
        return db.createIdentity({
          userId: ctx.user?.id,
          ...input,
        });
      }),
  }),

  // ─── Cagnottes ───────────────────────────────────────────────────
  cagnottes: router({
    list: publicProcedure.query(async () => {
      return db.getActiveCagnottes();
    }),
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getCagnotteById(input.id);
      }),
    create: publicProcedure
      .input(z.object({
        title: z.string().min(3),
        description: z.string().optional(),
        category: z.string(),
        carrierType: z.string().optional(),
        targetAmount: z.number().min(1000),
        mobileMoneyNumber: z.string().optional(),
        creatorPhone: z.string().optional(),
        creatorName: z.string().optional(),
        healthData: z.any().optional(),
        ngoData: z.any().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const needsReview = ["sante", "association_ong"].includes(input.category);
        return db.createCagnotte({
          userId: ctx.user?.id,
          ...input,
          status: needsReview ? "pending_review" : "active",
        });
      }),
    contributions: publicProcedure
      .input(z.object({ cagnotteId: z.number() }))
      .query(async ({ input }) => {
        return db.getCagnotteContributions(input.cagnotteId);
      }),
  }),

  // ─── Contributions ──────────────────────────────────────────────
  contributions: router({
    create: publicProcedure
      .input(z.object({
        cagnotteId: z.number(),
        contributorName: z.string().optional(),
        contributorPhone: z.string().min(8),
        amount: z.number().min(100),
        message: z.string().optional(),
        paymentMethod: z.string().optional(),
        isAnonymous: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.createContribution({
          userId: ctx.user?.id,
          ...input,
        });
        // Update cagnotte amount (simulate completed payment)
        await db.updateCagnotteAmount(input.cagnotteId, input.amount);
        return result;
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
      .mutation(async ({ input, ctx }) => {
        return db.createDonation({
          userId: ctx.user?.id,
          ...input,
        });
      }),
    list: publicProcedure.query(async () => {
      return db.getAllDonations();
    }),
  }),

  // ─── Points ─────────────────────────────────────────────────────
  points: router({
    history: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserPointHistory(ctx.user.id);
    }),
  }),

  // ─── Payments ───────────────────────────────────────────────────
  payments: router({
    initiate: publicProcedure
      .input(z.object({
        type: z.enum(["advance", "remaining", "contribution", "donation"]),
        referenceId: z.number().optional(),
        amount: z.number().min(100),
        method: z.enum(["ussd_orange", "ussd_moov", "ligidicash"]),
        phone: z.string().min(8),
      }))
      .mutation(async ({ input }) => {
        const payment = await db.createPayment(input);
        // In production, this would call the actual payment provider
        // For now, simulate successful payment
        if (payment) {
          const dbInstance = await getDb();
          if (dbInstance) {
            await dbInstance.update(payments)
              .set({ status: "completed", providerTransactionId: `SIM-${nanoid(8)}` })
              .where(eq(payments.id, payment.id));
          }
        }
        return { paymentId: payment?.id, status: "completed" };
      }),
  }),

  // ─── Admin ──────────────────────────────────────────────────────
  admin: router({
    stats: adminProcedure.query(async () => {
      return db.getAdminStats();
    }),
    orders: adminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }).optional())
      .query(async ({ input }) => {
        return db.getAllOrders(input?.limit, input?.offset);
      }),
    updateOrderStatus: adminProcedure
      .input(z.object({
        orderId: z.number(),
        collectionStatus: z.enum(["waiting", "ready", "collected"]).optional(),
        paymentStatus: z.enum(["pending", "advance_paid", "fully_paid", "failed"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const dbInstance = await getDb();
        if (!dbInstance) return;
        const updateData: Record<string, any> = {};
        if (input.collectionStatus) updateData.collectionStatus = input.collectionStatus;
        if (input.paymentStatus) updateData.paymentStatus = input.paymentStatus;
        await dbInstance.update(orders).set(updateData).where(eq(orders.id, input.orderId));
        return { success: true };
      }),
    cagnottes: adminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }).optional())
      .query(async ({ input }) => {
        return db.getAllCagnottes(input?.limit, input?.offset);
      }),
    approveCagnotte: adminProcedure
      .input(z.object({ cagnotteId: z.number() }))
      .mutation(async ({ input }) => {
        const dbInstance = await getDb();
        if (!dbInstance) return;
        await dbInstance.update(cagnottes).set({ status: "active" }).where(eq(cagnottes.id, input.cagnotteId));
        return { success: true };
      }),
    rejectCagnotte: adminProcedure
      .input(z.object({ cagnotteId: z.number(), reason: z.string() }))
      .mutation(async ({ input }) => {
        const dbInstance = await getDb();
        if (!dbInstance) return;
        await dbInstance.update(cagnottes).set({ status: "rejected", rejectionReason: input.reason }).where(eq(cagnottes.id, input.cagnotteId));
        return { success: true };
      }),
    identities: adminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }).optional())
      .query(async ({ input }) => {
        return db.getAllIdentities(input?.limit, input?.offset);
      }),
    verifyIdentity: adminProcedure
      .input(z.object({ identityId: z.number(), status: z.enum(["verified", "rejected"]) }))
      .mutation(async ({ input }) => {
        const dbInstance = await getDb();
        if (!dbInstance) return;
        await dbInstance.update(identities).set({ status: input.status }).where(eq(identities.id, input.identityId));
        return { success: true };
      }),
    payments: adminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }).optional())
      .query(async ({ input }) => {
        return db.getAllPayments(input?.limit, input?.offset);
      }),
    users: adminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }).optional())
      .query(async ({ input }) => {
        return db.getAllUsers(input?.limit, input?.offset);
      }),
    donations: adminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }).optional())
      .query(async ({ input }) => {
        return db.getAllDonations(input?.limit, input?.offset);
      }),
    adjustPoints: adminProcedure
      .input(z.object({ userId: z.number(), points: z.number(), description: z.string() }))
      .mutation(async ({ input }) => {
        await db.addPointTransaction({
          userId: input.userId,
          action: "admin_adjustment",
          points: input.points,
          description: input.description,
        });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
