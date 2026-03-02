import { COOKIE_NAME, REFRESH_COOKIE_NAME } from "@shared/const";
import { parse as parseCookie, serialize as serializeCookie } from "cookie";
import type { NextFunction, Request, Response } from "express";
import { issueSessionCookies } from "./session";
import { sdk } from "./sdk";

function updateRequestCookies(req: Request, name: string, value: string): void {
  const rawCookie = req.headers.cookie ?? "";
  const parsed = rawCookie ? parseCookie(rawCookie) : {};
  parsed[name] = value;
  req.headers.cookie = Object.entries(parsed)
    .map(([k, v]) => serializeCookie(k, v))
    .join("; ");
}

export async function refreshSessionIfNeeded(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.path.startsWith("/api")) {
    next();
    return;
  }

  if (req.path.startsWith("/api/webhooks/")) {
    next();
    return;
  }

  const cookies = req.headers.cookie ? parseCookie(req.headers.cookie) : {};
  const access = cookies[COOKIE_NAME] ?? null;

  const accessSession = await sdk.verifySession(access);
  if (accessSession) {
    next();
    return;
  }

  const refresh = cookies[REFRESH_COOKIE_NAME] ?? null;
  const refreshSession = await sdk.verifyRefreshToken(refresh);
  if (!refreshSession) {
    next();
    return;
  }

  const tokens = await issueSessionCookies(req, res, {
    openId: refreshSession.openId,
    name: refreshSession.name,
  });

  updateRequestCookies(req, COOKIE_NAME, tokens.accessToken);
  updateRequestCookies(req, REFRESH_COOKIE_NAME, tokens.refreshToken);
  next();
}
