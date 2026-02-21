import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  json,
  bigint,
  decimal,
} from "drizzle-orm/mysql-core";

// ─── Users ───────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  firstName: text("firstName"),
  lastName: text("lastName"),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "super_admin"]).default("user").notNull(),
  points: int("points").default(0).notNull(),
  level: mysqlEnum("level", ["bronze", "silver", "gold", "platinum"]).default("bronze").notNull(),
  referralCode: varchar("referralCode", { length: 16 }),
  referredBy: varchar("referredBy", { length: 16 }),
  language: varchar("language", { length: 5 }).default("fr"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── OTP Codes ───────────────────────────────────────────────────────
export const otpCodes = mysqlTable("otp_codes", {
  id: int("id").autoincrement().primaryKey(),
  phone: varchar("phone", { length: 20 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Products ────────────────────────────────────────────────────────
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  contents: json("contents"),
  category: varchar("category", { length: 100 }),
  standardPrice: int("standardPrice").notNull(),
  groupPrice: int("groupPrice").notNull(),
  discount: int("discount").default(0),
  groupSize: int("groupSize").default(50),
  imageUrl: text("imageUrl"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;

// ─── Groups ──────────────────────────────────────────────────────────
export const groups = mysqlTable("groups", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  currentMembers: int("currentMembers").default(0).notNull(),
  maxMembers: int("maxMembers").default(50).notNull(),
  status: mysqlEnum("status", ["forming", "full", "ordered", "ready", "completed"]).default("forming").notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Group = typeof groups.$inferSelect;

// ─── Orders ──────────────────────────────────────────────────────────
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  groupId: int("groupId").notNull(),
  productId: int("productId").notNull(),
  orderCode: varchar("orderCode", { length: 20 }).notNull().unique(),
  advanceAmount: int("advanceAmount").notNull(),
  remainingAmount: int("remainingAmount").notNull(),
  totalAmount: int("totalAmount").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 30 }),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "advance_paid", "fully_paid", "failed"]).default("pending").notNull(),
  identityStatus: mysqlEnum("identityStatus", ["pending", "verified", "rejected"]).default("pending").notNull(),
  collectionStatus: mysqlEnum("collectionStatus", ["waiting", "ready", "collected"]).default("waiting").notNull(),
  customerPhone: varchar("customerPhone", { length: 20 }),
  customerName: text("customerName"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;

// ─── Identities ──────────────────────────────────────────────────────
export const identities = mysqlTable("identities", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  orderId: int("orderId"),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  firstName: varchar("firstName", { length: 255 }),
  documentType: mysqlEnum("documentType", ["cni", "passport", "permit"]).notNull(),
  documentNumber: varchar("documentNumber", { length: 100 }).notNull(),
  documentImageUrl: text("documentImageUrl"),
  phone: varchar("phone", { length: 20 }),
  status: mysqlEnum("status", ["pending", "verified", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Cagnottes ───────────────────────────────────────────────────────
export const cagnottes = mysqlTable("cagnottes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  carrierType: varchar("carrierType", { length: 50 }),
  targetAmount: int("targetAmount").notNull(),
  currentAmount: int("currentAmount").default(0).notNull(),
  contributorsCount: int("contributorsCount").default(0).notNull(),
  mobileMoneyNumber: varchar("mobileMoneyNumber", { length: 20 }),
  status: mysqlEnum("status", ["active", "pending_review", "completed", "rejected"]).default("active").notNull(),
  rejectionReason: text("rejectionReason"),
  healthData: json("healthData"),
  ngoData: json("ngoData"),
  creatorPhone: varchar("creatorPhone", { length: 20 }),
  creatorName: varchar("creatorName", { length: 255 }),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Cagnotte = typeof cagnottes.$inferSelect;

// ─── Contributions ───────────────────────────────────────────────────
export const contributions = mysqlTable("contributions", {
  id: int("id").autoincrement().primaryKey(),
  cagnotteId: int("cagnotteId").notNull(),
  userId: int("userId"),
  contributorName: varchar("contributorName", { length: 255 }),
  contributorPhone: varchar("contributorPhone", { length: 20 }),
  amount: int("amount").notNull(),
  message: text("message"),
  paymentMethod: varchar("paymentMethod", { length: 30 }),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "completed", "failed"]).default("pending").notNull(),
  isAnonymous: boolean("isAnonymous").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Donations (BIGA CONNECT) ────────────────────────────────────────
export const donations = mysqlTable("donations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  donorName: varchar("donorName", { length: 255 }),
  donorPhone: varchar("donorPhone", { length: 20 }),
  amount: int("amount").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 30 }),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "completed", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Point Transactions ──────────────────────────────────────────────
export const pointTransactions = mysqlTable("point_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  points: int("points").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Payments ────────────────────────────────────────────────────────
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["advance", "remaining", "contribution", "donation"]).notNull(),
  referenceId: int("referenceId"),
  amount: int("amount").notNull(),
  method: mysqlEnum("method", ["ussd_orange", "ussd_moov", "ligidicash"]).notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  providerTransactionId: varchar("providerTransactionId", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Notifications ───────────────────────────────────────────────────
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Admin Config ────────────────────────────────────────────────────
export const adminConfig = mysqlTable("admin_config", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
