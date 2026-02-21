import { eq, desc, and, sql, like, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users, products, groups, orders, identities,
  cagnottes, contributions, donations, pointTransactions, payments,
  notifications, adminConfig, otpCodes
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ───────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod", "phone", "firstName", "lastName"] as const;
  type TextField = (typeof textFields)[number];
  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    values[field] = value ?? null;
    updateSet[field] = value ?? null;
  };
  textFields.forEach(assignNullable);

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = 'admin';
    updateSet.role = 'admin';
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByPhone(phone: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
  return result[0] ?? undefined;
}

export async function getAllUsers(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset);
}

export async function updateUserPoints(userId: number, pointsDelta: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ points: sql`points + ${pointsDelta}` }).where(eq(users.id, userId));
  // Check level upgrade
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (user) {
    let newLevel: "bronze" | "silver" | "gold" | "platinum" = "bronze";
    if (user.points >= 5000) newLevel = "platinum";
    else if (user.points >= 2000) newLevel = "gold";
    else if (user.points >= 500) newLevel = "silver";
    if (newLevel !== user.level) {
      await db.update(users).set({ level: newLevel }).where(eq(users.id, userId));
    }
  }
}

// ─── Products ────────────────────────────────────────────────────────
export async function getActiveProducts(category?: string) {
  const db = await getDb();
  if (!db) return [];
  if (category) {
    return db.select().from(products).where(and(eq(products.isActive, true), eq(products.category, category)));
  }
  return db.select().from(products).where(eq(products.isActive, true));
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result[0] ?? undefined;
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0] ?? undefined;
}

// ─── Groups ──────────────────────────────────────────────────────────
export async function getActiveGroups(productId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (productId) {
    return db.select().from(groups).where(and(eq(groups.status, "forming"), eq(groups.productId, productId)));
  }
  return db.select().from(groups).where(eq(groups.status, "forming"));
}

export async function getGroupById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(groups).where(eq(groups.id, id)).limit(1);
  return result[0] ?? undefined;
}

export async function incrementGroupMembers(groupId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(groups).set({ currentMembers: sql`currentMembers + 1` }).where(eq(groups.id, groupId));
  const [group] = await db.select().from(groups).where(eq(groups.id, groupId)).limit(1);
  if (group && group.currentMembers >= group.maxMembers) {
    await db.update(groups).set({ status: "full" }).where(eq(groups.id, groupId));
  }
}

// ─── Orders ──────────────────────────────────────────────────────────
export async function createOrder(data: {
  userId?: number; groupId: number; productId: number; orderCode: string;
  advanceAmount: number; remainingAmount: number; totalAmount: number;
  customerPhone?: string; customerName?: string;
}) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(orders).values(data);
  return { id: Number(result[0].insertId), orderCode: data.orderCode };
}

export async function getOrderByCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.orderCode, code)).limit(1);
  return result[0] ?? undefined;
}

export async function getAllOrders(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit).offset(offset);
}

export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

// ─── Identities ──────────────────────────────────────────────────────
export async function createIdentity(data: {
  userId?: number; orderId?: number; fullName: string; firstName?: string;
  documentType: "cni" | "passport" | "permit"; documentNumber: string;
  documentImageUrl?: string; phone?: string;
}) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(identities).values(data);
  return { id: Number(result[0].insertId) };
}

export async function getPendingIdentities() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(identities).where(eq(identities.status, "pending")).orderBy(desc(identities.createdAt));
}

// ─── Cagnottes ───────────────────────────────────────────────────────
export async function getActiveCagnottes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cagnottes).where(eq(cagnottes.status, "active")).orderBy(desc(cagnottes.createdAt));
}

export async function getCagnotteById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(cagnottes).where(eq(cagnottes.id, id)).limit(1);
  return result[0] ?? undefined;
}

export async function createCagnotte(data: {
  userId?: number; title: string; description?: string; category: string;
  carrierType?: string; targetAmount: number; mobileMoneyNumber?: string;
  healthData?: any; ngoData?: any; creatorPhone?: string; creatorName?: string;
  status?: "active" | "pending_review";
}) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(cagnottes).values(data);
  return { id: Number(result[0].insertId) };
}

export async function getPendingCagnottes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cagnottes).where(eq(cagnottes.status, "pending_review")).orderBy(desc(cagnottes.createdAt));
}

export async function updateCagnotteAmount(cagnotteId: number, amount: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(cagnottes).set({
    currentAmount: sql`currentAmount + ${amount}`,
    contributorsCount: sql`contributorsCount + 1`,
  }).where(eq(cagnottes.id, cagnotteId));
}

// ─── Contributions ───────────────────────────────────────────────────
export async function createContribution(data: {
  cagnotteId: number; userId?: number; contributorName?: string;
  contributorPhone?: string; amount: number; message?: string;
  paymentMethod?: string; isAnonymous?: boolean;
}) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(contributions).values(data);
  return { id: Number(result[0].insertId) };
}

export async function getCagnotteContributions(cagnotteId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contributions)
    .where(and(eq(contributions.cagnotteId, cagnotteId), eq(contributions.paymentStatus, "completed")))
    .orderBy(desc(contributions.createdAt));
}

// ─── Donations ───────────────────────────────────────────────────────
export async function createDonation(data: {
  userId?: number; donorName?: string; donorPhone?: string;
  amount: number; paymentMethod?: string;
}) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(donations).values(data);
  return { id: Number(result[0].insertId) };
}

export async function getAllDonations(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(donations).orderBy(desc(donations.createdAt)).limit(limit).offset(offset);
}

// ─── Points ──────────────────────────────────────────────────────────
export async function addPointTransaction(data: {
  userId: number; action: string; points: number; description?: string;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(pointTransactions).values(data);
  await updateUserPoints(data.userId, data.points);
}

export async function getUserPointHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pointTransactions).where(eq(pointTransactions.userId, userId)).orderBy(desc(pointTransactions.createdAt));
}

// ─── Payments ────────────────────────────────────────────────────────
export async function createPayment(data: {
  type: "advance" | "remaining" | "contribution" | "donation";
  referenceId?: number; amount: number;
  method: "ussd_orange" | "ussd_moov" | "ligidicash";
  phone?: string;
}) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(payments).values(data);
  return { id: Number(result[0].insertId) };
}

export async function getAllPayments(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payments).orderBy(desc(payments.createdAt)).limit(limit).offset(offset);
}

// ─── Notifications ───────────────────────────────────────────────────
export async function createNotification(data: {
  userId: number; type: string; title: string; message?: string;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(notifications).values(data);
}

// ─── Admin Stats ─────────────────────────────────────────────────────
export async function getAdminStats() {
  const db = await getDb();
  if (!db) return { users: 0, orders: 0, cagnottes: 0, donations: 0, revenue: 0 };
  const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [orderCount] = await db.select({ count: sql<number>`count(*)` }).from(orders);
  const [cagnotteCount] = await db.select({ count: sql<number>`count(*)` }).from(cagnottes).where(eq(cagnottes.status, "active"));
  const [donationTotal] = await db.select({ total: sql<number>`COALESCE(SUM(amount), 0)` }).from(donations).where(eq(donations.paymentStatus, "completed"));
  const [orderRevenue] = await db.select({ total: sql<number>`COALESCE(SUM(advanceAmount), 0)` }).from(orders).where(eq(orders.paymentStatus, "advance_paid"));
  return {
    users: userCount?.count ?? 0,
    orders: orderCount?.count ?? 0,
    cagnottes: cagnotteCount?.count ?? 0,
    donations: donationTotal?.total ?? 0,
    revenue: (orderRevenue?.total ?? 0) + (donationTotal?.total ?? 0),
  };
}

export async function getAllCagnottes(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cagnottes).orderBy(desc(cagnottes.createdAt)).limit(limit).offset(offset);
}

export async function getAllIdentities(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(identities).orderBy(desc(identities.createdAt)).limit(limit).offset(offset);
}
