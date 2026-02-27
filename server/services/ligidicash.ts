/**
 * server/services/ligidicash.ts
 * ─────────────────────────────────────────────────────────────────────
 * Ligidicash payment gateway integration (Burkina Faso).
 * ~80% complete — endpoint paths and exact request/response shapes
 * must be confirmed against the Ligidicash API documentation.
 *
 * Environment variables:
 *   LIGIDICASH_API_URL        — Base URL (ex: https://api.ligidicash.com/v1)
 *   LIGIDICASH_MERCHANT_ID    — Merchant identifier
 *   LIGIDICASH_API_KEY        — API key / secret for signing
 *   LIGIDICASH_WEBHOOK_SECRET — HMAC secret for webhook signature verification
 *
 * ⚠️  TODO with Ligidicash doc:
 *   1. Confirm exact endpoint paths (INITIATE_PATH, STATUS_PATH, REFUND_PATH)
 *   2. Confirm request body field names (merchantId vs merchant_id, etc.)
 *   3. Confirm HMAC signature format (header name, hash algorithm, payload format)
 *   4. Map LigidicashStatus enum values to actual API response values
 */

import axios from "axios";
import crypto from "crypto";
import { ENV } from "../_core/env";

// ─── Config ───────────────────────────────────────────────────────────
const API_URL        = process.env.LIGIDICASH_API_URL        ?? "https://api.ligidicash.com/v1"; // ← confirm with doc
const MERCHANT_ID    = process.env.LIGIDICASH_MERCHANT_ID    ?? "";
const API_KEY        = process.env.LIGIDICASH_API_KEY        ?? "";
const WEBHOOK_SECRET = process.env.LIGIDICASH_WEBHOOK_SECRET ?? "";

// ─── Endpoint paths ───────────────────────────────────────────────────
// ⚠️ TODO: confirm these paths against Ligidicash API documentation
const INITIATE_PATH  = "/payments/initiate";    // POST — initiate payment
const STATUS_PATH    = "/payments/status";       // GET  — check payment status
const REFUND_PATH    = "/payments/refund";       // POST — refund a payment
const BALANCE_PATH   = "/merchant/balance";      // GET  — merchant balance

// ─── Types ────────────────────────────────────────────────────────────

/** Payment types Terra Biga uses */
export type LigidicashPaymentType = "advance" | "remaining" | "creation_fee" | "contribution";

export interface InitiatePaymentParams {
  amount: number;          // FCFA, integer
  phone: string;           // payer phone in E.164 (+226XXXXXXXX)
  reference: string;       // unique reference (order code, cagnotte id, etc.)
  type: LigidicashPaymentType;
  description: string;     // shown in OTP SMS to payer
  callbackUrl?: string;    // override default webhook URL
  metadata?: Record<string, unknown>;
}

export interface InitiatePaymentResult {
  transactionId: string;  // Ligidicash internal TX id
  reference: string;      // echoed back
  status: LigidicashStatus;
  otpSent: boolean;       // true if OTP SMS sent to payer
  expiresAt?: Date;
}

// ⚠️ TODO: map these to actual status strings from Ligidicash API
export type LigidicashStatus =
  | "pending"     // waiting for payer OTP confirmation
  | "completed"   // payment successful
  | "failed"      // payment failed (insufficient funds, wrong OTP, etc.)
  | "expired"     // payer didn't confirm in time
  | "refunded";   // refund processed

export interface PaymentStatusResult {
  transactionId: string;
  reference: string;
  status: LigidicashStatus;
  amount: number;
  phone: string;
  completedAt?: Date;
  failureReason?: string;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  originalTransactionId: string;
  amount: number;
}

// ─── HTTP client ──────────────────────────────────────────────────────

const client = axios.create({
  baseURL: API_URL,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
    // ⚠️ TODO: confirm auth header format with Ligidicash
    // Common patterns: "Authorization: Bearer <key>", "X-API-Key: <key>", or HMAC per request
    "X-Merchant-Id": MERCHANT_ID,
    "Authorization": `Bearer ${API_KEY}`,
  },
});

/** Add request logging in dev */
client.interceptors.request.use(req => {
  if (!ENV.isProduction) {
    console.log(`[Ligidicash] ${req.method?.toUpperCase()} ${req.baseURL}${req.url}`, req.data);
  }
  return req;
});

// ─── Request signing (if required by Ligidicash) ─────────────────────
// ⚠️ TODO: confirm if Ligidicash requires per-request HMAC signing
// If yes, uncomment and adapt the signRequest function below.

/*
function signRequest(payload: Record<string, unknown>, timestamp: string): string {
  const message = timestamp + JSON.stringify(payload);
  return crypto
    .createHmac("sha256", API_KEY)
    .update(message)
    .digest("hex");
}
*/

// ─── Core API functions ───────────────────────────────────────────────

/**
 * Initiate a Ligidicash OTP payment.
 * Returns immediately with a transactionId; actual completion via webhook.
 */
export async function initiatePayment(
  params: InitiatePaymentParams
): Promise<InitiatePaymentResult> {
  if (!MERCHANT_ID || !API_KEY) {
    if (!ENV.isProduction) {
      // Dev simulation
      console.log(`[Ligidicash DEV] Would initiate payment:`, params);
      return {
        transactionId: `LC-SIM-${Date.now()}`,
        reference: params.reference,
        status: "pending",
        otpSent: true,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };
    }
    throw new Error("Ligidicash credentials not configured");
  }

  // ⚠️ TODO: adapt request body to match Ligidicash API doc field names
  const payload = {
    merchantId: MERCHANT_ID,          // might be merchant_id
    amount: params.amount,
    currency: "XOF",                  // ← confirm currency code
    phone: params.phone,
    reference: params.reference,
    description: params.description,
    callbackUrl: params.callbackUrl ?? `${process.env.APP_URL}/api/webhooks/ligidicash`,
    metadata: params.metadata,
  };

  const { data } = await client.post<{
    // ⚠️ TODO: map these to actual Ligidicash response field names
    transaction_id: string;
    status: string;
    otp_sent: boolean;
    expires_at?: string;
  }>(INITIATE_PATH, payload);

  return {
    transactionId: data.transaction_id,
    reference: params.reference,
    status: mapStatus(data.status),
    otpSent: data.otp_sent ?? true,
    expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
  };
}

/**
 * Poll payment status by transactionId or reference.
 * Prefer webhooks over polling in production.
 */
export async function getPaymentStatus(
  transactionId: string
): Promise<PaymentStatusResult> {
  if (!MERCHANT_ID || !API_KEY) {
    if (!ENV.isProduction) {
      return {
        transactionId,
        reference: "SIM-REF",
        status: "completed",
        amount: 0,
        phone: "",
      };
    }
    throw new Error("Ligidicash credentials not configured");
  }

  // ⚠️ TODO: confirm whether this is GET /payments/status?transactionId=xxx
  // or GET /payments/{transactionId}
  const { data } = await client.get<{
    transaction_id: string;
    reference: string;
    status: string;
    amount: number;
    phone: string;
    completed_at?: string;
    failure_reason?: string;
  }>(`${STATUS_PATH}/${transactionId}`);

  return {
    transactionId: data.transaction_id,
    reference: data.reference,
    status: mapStatus(data.status),
    amount: data.amount,
    phone: data.phone,
    completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
    failureReason: data.failure_reason,
  };
}

/**
 * Refund a completed payment.
 * Used if a group is cancelled before delivery.
 */
export async function refundPayment(
  transactionId: string,
  amount?: number  // partial refund if provided, full refund otherwise
): Promise<RefundResult> {
  if (!MERCHANT_ID || !API_KEY) {
    throw new Error("Ligidicash credentials not configured");
  }

  const payload = {
    merchantId: MERCHANT_ID,
    transactionId,
    ...(amount ? { amount } : {}),
  };

  const { data } = await client.post<{
    refund_id: string;
    original_transaction_id: string;
    amount: number;
  }>(REFUND_PATH, payload);

  return {
    success: true,
    refundId: data.refund_id,
    originalTransactionId: data.original_transaction_id,
    amount: data.amount,
  };
}

/**
 * Get merchant wallet balance.
 */
export async function getMerchantBalance(): Promise<{ balance: number; currency: string }> {
  const { data } = await client.get<{ balance: number; currency: string }>(BALANCE_PATH);
  return data;
}

// ─── Webhook signature verification ──────────────────────────────────

/**
 * Verify Ligidicash webhook HMAC signature.
 * ⚠️ TODO: confirm signature format with Ligidicash:
 *   - Header name (X-Ligidicash-Signature, X-Signature, etc.)
 *   - Hash algorithm (sha256, sha1, etc.)
 *   - Payload format (raw body string, JSON-stringified, sorted keys, etc.)
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string
): boolean {
  if (!WEBHOOK_SECRET) {
    console.warn("[Ligidicash] WEBHOOK_SECRET not configured — skipping signature verification");
    return !ENV.isProduction; // allow in dev, reject in prod
  }

  // ⚠️ TODO: confirm exact format. Common pattern:
  // signature = HMAC-SHA256(WEBHOOK_SECRET, rawBody).hex
  const expected = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  // Some providers send "sha256=<hex>" prefix
  const received = signatureHeader.startsWith("sha256=")
    ? signatureHeader.slice(7)
    : signatureHeader;

  return crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(received, "hex")
  );
}

// ─── Webhook payload types ────────────────────────────────────────────

export interface LigidicashWebhookPayload {
  // ⚠️ TODO: map to actual Ligidicash webhook payload structure
  transaction_id: string;
  reference: string;
  status: string;         // "completed" | "failed" | "expired"
  amount: number;
  phone: string;
  merchant_id: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// ─── Status mapping ───────────────────────────────────────────────────

// ⚠️ TODO: replace these string values with actual Ligidicash status strings
function mapStatus(raw: string): LigidicashStatus {
  const map: Record<string, LigidicashStatus> = {
    "pending":    "pending",
    "processing": "pending",
    "success":    "completed",
    "completed":  "completed",
    "failed":     "failed",
    "failure":    "failed",
    "error":      "failed",
    "expired":    "expired",
    "timeout":    "expired",
    "refunded":   "refunded",
  };
  return map[raw?.toLowerCase()] ?? "pending";
}

export { mapStatus };
