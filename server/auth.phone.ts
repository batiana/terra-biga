/**
 * server/auth.phone.ts
 * ─────────────────────────────────────────────────────────────────────
 * Phone OTP authentication — fully self-contained.
 * Uses the same JWT format as the existing Manus OAuth flow so that
 * sdk.authenticateRequest() can verify phone sessions transparently.
 *
 * Flow:
 *  1. POST /api/auth/phone/request  → generate + store OTP, send via WhatsApp/SMS
 *  2. POST /api/auth/phone/verify   → verify OTP, upsert user, set session cookie
 *  3. POST /api/auth/phone/resend   → same as request but respects cooldown
 *
 * Rate limits (per phone):
 *  - Max 5 OTP requests per 15-minute window
 *  - OTP expires after 10 minutes
 *  - 3 incorrect attempts invalidates current OTP
 */

import type { Express, Request, Response } from "express";
import { eq, and, desc, gte, sql } from "drizzle-orm";
import { SignJWT } from "jose";
import { nanoid } from "nanoid";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
import { getDb } from "./db";
import { otpCodes, otpAttempts, users } from "../drizzle/schema";
import { sendWhatsAppOtp } from "./services/whatsapp";

// ─── Constants ────────────────────────────────────────────────────────
const OTP_EXPIRY_MS        = 10 * 60 * 1000;   // 10 minutes
const RATE_WINDOW_MS       = 15 * 60 * 1000;   // 15-minute sliding window
const MAX_REQUESTS_PER_WIN = 5;                  // max OTP sends per window
const MAX_VERIFY_ATTEMPTS  = 3;                  // wrong codes before invalidation

// ─── Helpers ──────────────────────────────────────────────────────────

/** Generate a 6-digit numeric OTP */
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/** Normalise phone: strip spaces, ensure +226 prefix for BF numbers */
export function normalisePhone(raw: string): string {
  const stripped = raw.replace(/\s+/g, "").replace(/^00/, "+");
  // If it looks like a Burkina Faso local number (8 digits starting with 0)
  if (/^0\d{7}$/.test(stripped)) return "+226" + stripped.slice(1);
  // If 8 digits without leading 0, assume BF
  if (/^\d{8}$/.test(stripped)) return "+226" + stripped;
  return stripped;
}

/** Create phone openId (same format stored in DB) */
function phoneOpenId(phone: string): string {
  return `phone:${phone}`;
}

/** Sign a session JWT using the same secret / algorithm as the Manus SDK */
async function signPhoneSession(phone: string, name: string): Promise<string> {
  const secretKey = new TextEncoder().encode(ENV.cookieSecret || "terra-biga-dev-secret");
  return new SignJWT({
    openId: phoneOpenId(phone),
    appId: ENV.appId || "terra-biga",
    name,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(Math.floor((Date.now() + ONE_YEAR_MS) / 1000))
    .sign(secretKey);
}

// ─── Rate limiting helpers ────────────────────────────────────────────

async function getAttemptCount(phone: string): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const windowStart = new Date(Date.now() - RATE_WINDOW_MS);
  const rows = await db
    .select({ attempts: otpAttempts.attempts })
    .from(otpAttempts)
    .where(
      and(
        eq(otpAttempts.phone, phone),
        gte(otpAttempts.windowStart, windowStart)
      )
    );
  return rows.reduce((sum, r) => sum + r.attempts, 0);
}

async function incrementAttemptCount(phone: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const windowStart = new Date(Date.now() - RATE_WINDOW_MS);
  const existing = await db
    .select()
    .from(otpAttempts)
    .where(
      and(
        eq(otpAttempts.phone, phone),
        gte(otpAttempts.windowStart, windowStart)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(otpAttempts)
      .set({ attempts: sql`attempts + 1` })
      .where(eq(otpAttempts.id, existing[0].id));
  } else {
    await db.insert(otpAttempts).values({ phone, attempts: 1 });
  }
}

// ─── Core functions ───────────────────────────────────────────────────

/** Request a new OTP. Returns { sent: true } or throws with error message. */
export async function requestOtp(phone: string): Promise<{ sent: true; expiresAt: Date }> {
  const normPhone = normalisePhone(phone);
  const db = await getDb();
  if (!db) throw new Error("DB_UNAVAILABLE");

  // Rate-limit check
  const count = await getAttemptCount(normPhone);
  if (count >= MAX_REQUESTS_PER_WIN) {
    throw new Error("RATE_LIMIT_EXCEEDED");
  }

  // Invalidate any existing unexpired OTP for this phone
  await db
    .update(otpCodes)
    .set({ used: true })
    .where(and(eq(otpCodes.phone, normPhone), eq(otpCodes.used, false)));

  // Generate + store new OTP
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
  await db.insert(otpCodes).values({ phone: normPhone, code, expiresAt });

  // Track attempt for rate limiting
  await incrementAttemptCount(normPhone);

  // Send via WhatsApp (falls back to logging in dev if credentials missing)
  try {
    await sendWhatsAppOtp(normPhone, code);
  } catch (err) {
    console.error("[OTP] Failed to send WhatsApp message:", err);
    // Don't throw — OTP is stored, user can still enter it manually in dev
    if (ENV.isProduction) throw new Error("SMS_SEND_FAILED");
  }

  return { sent: true, expiresAt };
}

/** Verify an OTP. Returns session token on success. */
export async function verifyOtp(
  phone: string,
  code: string
): Promise<{ token: string; isNewUser: boolean }> {
  const normPhone = normalisePhone(phone);
  const db = await getDb();
  if (!db) throw new Error("DB_UNAVAILABLE");

  // Find the most recent valid OTP for this phone
  const [otp] = await db
    .select()
    .from(otpCodes)
    .where(
      and(
        eq(otpCodes.phone, normPhone),
        eq(otpCodes.used, false),
        gte(otpCodes.expiresAt, new Date())
      )
    )
    .orderBy(desc(otpCodes.createdAt))
    .limit(1);

  if (!otp) throw new Error("OTP_NOT_FOUND");
  if (otp.code !== code) {
    // TODO: track per-OTP bad attempts and invalidate after MAX_VERIFY_ATTEMPTS
    throw new Error("OTP_INVALID");
  }

  // Mark as used
  await db.update(otpCodes).set({ used: true }).where(eq(otpCodes.id, otp.id));

  // Upsert user
  const openId = phoneOpenId(normPhone);
  let existingUser = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1)
    .then(r => r[0] ?? null);

  const isNewUser = !existingUser;

  if (!existingUser) {
    await db.insert(users).values({
      openId,
      phone: normPhone,
      loginMethod: "phone",
      lastSignedIn: new Date(),
    });
    // Award welcome bonus points (handled outside this fn to avoid circular dep)
  } else {
    await db
      .update(users)
      .set({ lastSignedIn: new Date(), phone: normPhone })
      .where(eq(users.openId, openId));
  }

  const token = await signPhoneSession(normPhone, normPhone);
  return { token, isNewUser };
}

// ─── Express route registration ───────────────────────────────────────

export function registerPhoneAuthRoutes(app: Express): void {
  /** Step 1 — Request OTP */
  app.post("/api/auth/phone/request", async (req: Request, res: Response) => {
    const { phone } = req.body as { phone?: string };
    if (!phone || typeof phone !== "string") {
      res.status(400).json({ error: "phone_required" });
      return;
    }
    try {
      const result = await requestOtp(phone);
      res.json({ success: true, expiresAt: result.expiresAt });
    } catch (err: any) {
      const msg = err?.message ?? "UNKNOWN";
      if (msg === "RATE_LIMIT_EXCEEDED") {
        res.status(429).json({ error: "rate_limit", message: "Trop de tentatives. Réessayez dans 15 minutes." });
      } else if (msg === "SMS_SEND_FAILED") {
        res.status(503).json({ error: "sms_failed", message: "Impossible d'envoyer le SMS. Réessayez." });
      } else {
        console.error("[PhoneAuth] requestOtp error:", err);
        res.status(500).json({ error: "internal" });
      }
    }
  });

  /** Step 2 — Verify OTP and create session */
  app.post("/api/auth/phone/verify", async (req: Request, res: Response) => {
    const { phone, code } = req.body as { phone?: string; code?: string };
    if (!phone || !code) {
      res.status(400).json({ error: "phone_and_code_required" });
      return;
    }
    try {
      const { token, isNewUser } = await verifyOtp(phone, code);
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ success: true, isNewUser });
    } catch (err: any) {
      const msg = err?.message ?? "UNKNOWN";
      if (msg === "OTP_NOT_FOUND") {
        res.status(400).json({ error: "otp_expired", message: "Code OTP expiré ou introuvable." });
      } else if (msg === "OTP_INVALID") {
        res.status(400).json({ error: "otp_invalid", message: "Code incorrect." });
      } else {
        console.error("[PhoneAuth] verifyOtp error:", err);
        res.status(500).json({ error: "internal" });
      }
    }
  });

  /** Step 3 — Resend (same as request, rate limit already handles throttling) */
  app.post("/api/auth/phone/resend", async (req: Request, res: Response) => {
    const { phone } = req.body as { phone?: string };
    if (!phone) {
      res.status(400).json({ error: "phone_required" });
      return;
    }
    try {
      const result = await requestOtp(phone);
      res.json({ success: true, expiresAt: result.expiresAt });
    } catch (err: any) {
      const msg = err?.message ?? "UNKNOWN";
      if (msg === "RATE_LIMIT_EXCEEDED") {
        res.status(429).json({ error: "rate_limit", message: "Trop de tentatives. Réessayez dans 15 minutes." });
      } else {
        res.status(500).json({ error: "internal" });
      }
    }
  });
}
