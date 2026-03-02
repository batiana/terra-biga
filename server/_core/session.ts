import {
  ACCESS_TOKEN_MS,
  COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  REFRESH_TOKEN_MS,
} from "@shared/const";
import type { Request, Response } from "express";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

export async function issueSessionCookies(
  req: Request,
  res: Response,
  params: { openId: string; name: string }
): Promise<{ accessToken: string; refreshToken: string }> {
  const sessionName = params.name || params.openId;
  const accessToken = await sdk.createSessionToken(params.openId, {
    name: sessionName,
    expiresInMs: ACCESS_TOKEN_MS,
  });
  const refreshToken = await sdk.createRefreshToken(params.openId, {
    name: sessionName,
    expiresInMs: REFRESH_TOKEN_MS,
  });

  const cookieOptions = getSessionCookieOptions(req);
  res.cookie(COOKIE_NAME, accessToken, {
    ...cookieOptions,
    maxAge: ACCESS_TOKEN_MS,
  });
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    ...cookieOptions,
    maxAge: REFRESH_TOKEN_MS,
  });

  return { accessToken, refreshToken };
}

export function clearSessionCookies(req: Request, res: Response): void {
  const cookieOptions = getSessionCookieOptions(req);
  res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
  res.clearCookie(REFRESH_COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
}
