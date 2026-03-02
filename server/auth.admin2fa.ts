import { ACCESS_TOKEN_MS, ADMIN_2FA_COOKIE_NAME } from "@shared/const";
import type { Express, Request, Response } from "express";
import { and, eq, gte } from "drizzle-orm";
import { adminOtpCodes } from "../drizzle/schema";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { getDb } from "./db";
import * as db from "./db";
import { sendWhatsAppOtp } from "./services/whatsapp";

const ADMIN_OTP_EXPIRY_MS = 10 * 60 * 1000;
const ADMIN_MAX_ATTEMPTS = 3;

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function getAuthenticatedAdmin(req: Request) {
  const user = await sdk.authenticateRequest(req);
  if (!user || user.role !== "admin") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export function registerAdmin2faRoutes(app: Express): void {
  app.get("/api/auth/admin/2fa/status", async (req: Request, res: Response) => {
    try {
      await getAuthenticatedAdmin(req);
      const verified = req.cookies?.[ADMIN_2FA_COOKIE_NAME] === "1";
      res.json({ verified });
    } catch {
      res.status(401).json({ verified: false });
    }
  });

  app.post("/api/auth/admin/2fa/request", async (req: Request, res: Response) => {
    try {
      const user = await getAuthenticatedAdmin(req);
      if (!user.phone) {
        res.status(400).json({ error: "admin_phone_required" });
        return;
      }

      const code = generateCode();
      await db.createAdminOtpCode({
        userId: user.id,
        code,
        expiresAt: new Date(Date.now() + ADMIN_OTP_EXPIRY_MS),
      });

      await sendWhatsAppOtp(user.phone, code);
      res.json({ success: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "UNKNOWN";
      if (message === "FORBIDDEN") {
        res.status(403).json({ error: "forbidden" });
      } else {
        res.status(500).json({ error: "internal" });
      }
    }
  });

  app.post("/api/auth/admin/2fa/verify", async (req: Request, res: Response) => {
    const { code } = req.body as { code?: string };
    if (!code) {
      res.status(400).json({ error: "code_required" });
      return;
    }

    try {
      const user = await getAuthenticatedAdmin(req);
      const database = await getDb();
      if (!database) {
        res.status(503).json({ error: "db_unavailable" });
        return;
      }

      const [otp] = await database
        .select()
        .from(adminOtpCodes)
        .where(
          and(
            eq(adminOtpCodes.userId, user.id),
            eq(adminOtpCodes.used, false),
            gte(adminOtpCodes.expiresAt, new Date())
          )
        )
        .limit(1);

      if (!otp) {
        res.status(400).json({ error: "otp_expired" });
        return;
      }

      if (otp.code !== code) {
        const nextAttempts = otp.attempts + 1;
        const locked = nextAttempts >= ADMIN_MAX_ATTEMPTS;
        await database
          .update(adminOtpCodes)
          .set({ attempts: nextAttempts, used: locked ? true : otp.used })
          .where(eq(adminOtpCodes.id, otp.id));

        if (locked) {
          res.status(429).json({ error: "otp_locked" });
          return;
        }

        res.status(400).json({ error: "otp_invalid" });
        return;
      }

      await database
        .update(adminOtpCodes)
        .set({ used: true })
        .where(eq(adminOtpCodes.id, otp.id));

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(ADMIN_2FA_COOKIE_NAME, "1", {
        ...cookieOptions,
        maxAge: ACCESS_TOKEN_MS,
      });

      await db.createAuditLog({
        userId: user.id,
        action: "admin_login",
        entity: "auth",
      });

      res.json({ success: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "UNKNOWN";
      if (message === "FORBIDDEN") {
        res.status(403).json({ error: "forbidden" });
      } else {
        res.status(500).json({ error: "internal" });
      }
    }
  });
}
