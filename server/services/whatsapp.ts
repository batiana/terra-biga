/**
 * server/services/whatsapp.ts
 * ─────────────────────────────────────────────────────────────────────
 * WhatsApp Business Cloud API (Meta) — wrapper for sending messages.
 *
 * Setup (environment variables required):
 *   WHATSAPP_TOKEN          — Bearer token from Meta Business Suite
 *   WHATSAPP_PHONE_ID       — Phone number ID (not the number itself)
 *   WHATSAPP_BUSINESS_ID    — WhatsApp Business Account ID (optional, for webhook verification)
 *   WHATSAPP_VERIFY_TOKEN   — Custom string for webhook verification endpoint
 *
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api/messages
 */

import axios from "axios";
import { ENV } from "../_core/env";

// ─── Config ───────────────────────────────────────────────────────────
const WA_API_VERSION = "v19.0";
const WA_BASE        = `https://graph.facebook.com/${WA_API_VERSION}`;
const WA_TOKEN       = process.env.WHATSAPP_TOKEN ?? "";
const WA_PHONE_ID    = process.env.WHATSAPP_PHONE_ID ?? "";

const isDev = !ENV.isProduction;

const waClient = axios.create({
  baseURL: WA_BASE,
  headers: {
    Authorization: `Bearer ${WA_TOKEN}`,
    "Content-Type": "application/json",
  },
  timeout: 10_000,
});

// ─── Types ────────────────────────────────────────────────────────────
interface WaTextMessage {
  messaging_product: "whatsapp";
  to: string;
  type: "text";
  text: { body: string; preview_url?: boolean };
}

interface WaTemplateMessage {
  messaging_product: "whatsapp";
  to: string;
  type: "template";
  template: {
    name: string;
    language: { code: string };
    components?: Array<{
      type: "body" | "header" | "button";
      parameters: Array<{ type: "text"; text: string }>;
    }>;
  };
}

type WaMessage = WaTextMessage | WaTemplateMessage;

interface WaResponse {
  messages: Array<{ id: string }>;
  contacts: Array<{ wa_id: string }>;
}

// ─── Core send function ───────────────────────────────────────────────

async function sendMessage(payload: WaMessage): Promise<WaResponse | null> {
  if (!WA_TOKEN || !WA_PHONE_ID) {
    if (isDev) {
      console.log("[WhatsApp DEV] Would send:", JSON.stringify(payload, null, 2));
      return null;
    }
    throw new Error("WhatsApp credentials not configured (WHATSAPP_TOKEN, WHATSAPP_PHONE_ID)");
  }

  try {
    const { data } = await waClient.post<WaResponse>(
      `/${WA_PHONE_ID}/messages`,
      payload
    );
    return data;
  } catch (err: any) {
    const detail = err?.response?.data ?? err?.message;
    console.error("[WhatsApp] Send failed:", detail);
    throw new Error(`WhatsApp API error: ${JSON.stringify(detail)}`);
  }
}

// ─── Public helpers ───────────────────────────────────────────────────

/**
 * Send OTP code via WhatsApp text message.
 * In production: use a WhatsApp-approved OTP template for better deliverability.
 * Template name assumed: "otp_code" with one body variable {{1}} = code.
 */
export async function sendWhatsAppOtp(to: string, code: string): Promise<void> {
  if (isDev && (!WA_TOKEN || !WA_PHONE_ID)) {
    console.log(`[WhatsApp OTP DEV] To: ${to} | Code: ${code}`);
    return;
  }

  // Try template first (approved = better deliverability), fall back to text
  try {
    await sendMessage({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: "otp_code",
        language: { code: "fr" },
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: code }],
          },
        ],
      },
    });
  } catch {
    // Fall back to plain text if template not yet approved
    await sendMessage({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: {
        body: `🔐 Votre code Terra Biga : *${code}*\n\nValide 10 minutes. Ne le partagez pas.`,
      },
    });
  }
}

/**
 * Send a plain text WhatsApp message.
 * Used for notifications when no template is needed.
 */
export async function sendWhatsAppText(to: string, body: string): Promise<void> {
  await sendMessage({
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body, preview_url: false },
  });
}

/**
 * Send a pre-approved template message.
 * @param to         Recipient phone in E.164 format (+226XXXXXXXX)
 * @param template   Meta template name (must be approved in your WABA)
 * @param lang       Language code (default: "fr")
 * @param variables  Ordered list of {{1}}, {{2}}... body variable values
 */
export async function sendWhatsAppTemplate(
  to: string,
  template: string,
  variables: string[],
  lang = "fr"
): Promise<void> {
  await sendMessage({
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: template,
      language: { code: lang },
      components: variables.length
        ? [
            {
              type: "body",
              parameters: variables.map(v => ({ type: "text" as const, text: v })),
            },
          ]
        : undefined,
    },
  });
}
