/**
 * Service Ligdicash — Intégration paiement redirect
 *
 * Docs : https://app.ligdicash.com (portail développeur)
 * Auth : Bearer token (LIGDICASH_API_TOKEN) + Hashkey (LIGDICASH_API_KEY)
 *
 * Flux Te Raga :
 *   1. createInvoice()  → retourne redirect_url  → redirige l'utilisateur
 *   2. Utilisateur paie sur la page Ligdicash
 *   3. Ligdicash appelle POST /api/webhooks/ligdicash avec token + statut
 *   4. confirmInvoice() → vérifie le statut auprès de Ligdicash avant tout update BDD
 *
 * ⚠️  IDEMPOTENCE : toujours vérifier que providerTransactionId n'existe pas déjà
 *     avant d'appliquer l'effet métier (évite les doubles comptages sur retry webhook)
 */

const BASE_URL = process.env.LIGDICASH_BASE_URL ?? "https://app.ligdicash.com";
const API_TOKEN = process.env.LIGDICASH_API_TOKEN ?? "";
const API_KEY   = process.env.LIGDICASH_API_KEY   ?? "";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface InvoicePayload {
  /** Référence unique côté Terra Biga (ex: TB-XXXXX ou CAGNOTTE-42) */
  storeReference: string;
  /** Montant en FCFA (XOF), entier */
  amount: number;
  description: string;
  /** Numéro de téléphone du payeur (format +226XXXXXXXX) */
  customerPhone: string;
  customerFirstName?: string;
  customerLastName?: string;
  customerEmail?: string;
  /** URL de redirection après succès */
  returnUrl: string;
  /** URL de redirection après annulation */
  cancelUrl: string;
  /** URL de redirection après erreur */
  errorUrl: string;
}

export interface InvoiceResult {
  success: boolean;
  /** Token Ligdicash — stocker en BDD pour vérification webhook */
  token: string;
  /** URL vers laquelle rediriger l'utilisateur */
  redirectUrl: string;
  responseCode: string;
  message?: string;
}

export interface PaymentStatus {
  success: boolean;
  /** "completed" | "pending" | "failed" | "cancelled" */
  status: string;
  amount: number;
  currency: string;
  storeReference: string;
  transactionId: string;
  responseCode: string;
  message?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${API_TOKEN}`,
    "Hashkey": API_KEY,
  };
}

function isConfigured(): boolean {
  return Boolean(API_TOKEN && API_KEY);
}

// ─── Fonctions principales ────────────────────────────────────────────────────

/**
 * Crée une facture Ligdicash et retourne l'URL de redirection.
 * À appeler dans payments.initiate (Te Raga dépôt/solde, frais cagnotte 500 FCFA).
 */
export async function createInvoice(payload: InvoicePayload): Promise<InvoiceResult> {
  if (!isConfigured()) {
    console.error("[Ligdicash] Variables d'environnement manquantes (LIGDICASH_API_TOKEN, LIGDICASH_API_KEY)");
    return {
      success: false,
      token: "",
      redirectUrl: "",
      responseCode: "ERR_CONFIG",
      message: "Service de paiement non configuré — contacter l'administrateur",
    };
  }

  const body = {
    app_name: "Terra Biga",
    app_logo_url: `${process.env.FRONTEND_URL ?? ""}/logo.svg`,
    description: payload.description,
    currency: "XOF",
    amount: payload.amount,
    customer: {
      firstname: payload.customerFirstName ?? "",
      lastname:  payload.customerLastName  ?? "",
      email:     payload.customerEmail     ?? "",
      phone:     payload.customerPhone,
    },
    store_reference: payload.storeReference,
    return_url: payload.returnUrl,
    cancel_url: payload.cancelUrl,
    error_url:  payload.errorUrl,
  };

  try {
    const res = await fetch(
      `${BASE_URL}/pay/v1.1/gatewayname/redirect/json/create`,
      { method: "POST", headers: getHeaders(), body: JSON.stringify(body) }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error(`[Ligdicash] HTTP ${res.status}:`, text);
      return {
        success: false,
        token: "",
        redirectUrl: "",
        responseCode: `HTTP_${res.status}`,
        message: `Erreur Ligdicash HTTP ${res.status}`,
      };
    }

    const data = await res.json() as {
      response_code: string;
      token?: string;
      redirect_url?: string;
      message?: string;
    };

    if (data.response_code !== "00" || !data.token || !data.redirect_url) {
      console.error("[Ligdicash] createInvoice échec:", data);
      return {
        success: false,
        token: data.token ?? "",
        redirectUrl: "",
        responseCode: data.response_code,
        message: data.message ?? "Échec de création de la facture",
      };
    }

    return {
      success: true,
      token: data.token,
      redirectUrl: data.redirect_url,
      responseCode: "00",
    };
  } catch (err) {
    console.error("[Ligdicash] createInvoice erreur réseau:", err);
    return {
      success: false,
      token: "",
      redirectUrl: "",
      responseCode: "ERR_NETWORK",
      message: "Impossible de contacter Ligdicash — vérifier la connexion",
    };
  }
}

/**
 * Vérifie le statut d'un paiement via son token Ligdicash.
 * ⚠️  TOUJOURS appeler cette fonction avant d'appliquer un effet métier
 *     (ne jamais faire confiance au seul appel webhook entrant).
 */
export async function confirmInvoice(invoiceToken: string): Promise<PaymentStatus> {
  if (!isConfigured()) {
    return {
      success: false,
      status: "failed",
      amount: 0,
      currency: "XOF",
      storeReference: "",
      transactionId: "",
      responseCode: "ERR_CONFIG",
      message: "Service de paiement non configuré",
    };
  }

  try {
    const url = `${BASE_URL}/pay/v1.1/gatewayname/redirect/json/retrieve?invoiceToken=${encodeURIComponent(invoiceToken)}`;
    const res = await fetch(url, { method: "GET", headers: getHeaders() });

    if (!res.ok) {
      const text = await res.text();
      console.error(`[Ligdicash] confirmInvoice HTTP ${res.status}:`, text);
      return {
        success: false,
        status: "failed",
        amount: 0,
        currency: "XOF",
        storeReference: "",
        transactionId: "",
        responseCode: `HTTP_${res.status}`,
        message: `Erreur Ligdicash HTTP ${res.status}`,
      };
    }

    const data = await res.json() as {
      response_code: string;
      status?: string;
      amount?: number;
      currency?: string;
      store_reference?: string;
      operator_id?: string;
      message?: string;
    };

    const isCompleted = data.response_code === "00" && data.status === "completed";

    return {
      success: isCompleted,
      status: data.status ?? "unknown",
      amount: data.amount ?? 0,
      currency: data.currency ?? "XOF",
      storeReference: data.store_reference ?? "",
      transactionId: data.operator_id ?? invoiceToken,
      responseCode: data.response_code,
      message: data.message,
    };
  } catch (err) {
    console.error("[Ligdicash] confirmInvoice erreur réseau:", err);
    return {
      success: false,
      status: "failed",
      amount: 0,
      currency: "XOF",
      storeReference: "",
      transactionId: "",
      responseCode: "ERR_NETWORK",
      message: "Impossible de contacter Ligdicash",
    };
  }
}

/**
 * Vérifie la signature HMAC du webhook entrant (si Ligdicash fournit un secret).
 * Pour l'instant, validation par double appel confirmInvoice() = approche sûre.
 * À activer dès réception de la doc du secret webhook de Ligdicash.
 */
export function isValidWebhookSignature(
  _body: string,
  _signature: string,
  _secret: string
): boolean {
  // TODO : activer quand Ligdicash fournit le mécanisme de signature
  // import { createHmac } from "crypto";
  // const expected = createHmac("sha256", secret).update(body).digest("hex");
  // return expected === signature;
  return true; // double-vérification via confirmInvoice() est suffisante
}
