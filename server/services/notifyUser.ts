/**
 * server/services/notifyUser.ts
 * ─────────────────────────────────────────────────────────────────────
 * Centralised notification service — all WhatsApp/SMS notifications
 * for Terra Biga events go through this file.
 *
 * 8 templates covered:
 *  1. contribution_received    — Porteur de cagnotte reçoit un don
 *  2. contribution_confirmed   — Contributeur confirmation de paiement
 *  3. cagnotte_goal_reached    — Objectif de cagnotte atteint
 *  4. group_full               — Groupe Te Raga complet, solde à payer
 *  5. balance_due              — Rappel paiement solde Te Raga
 *  6. order_ready              — Commande prête à récupérer (Dépôt ZAD)
 *  7. welcome_bonus            — Bienvenue + points offerts
 *  8. cagnotte_update          — Mise à jour publiée par le porteur
 */

import { sendWhatsAppText } from "./whatsapp";
import { formatFCFA } from "@shared/types";

// ─── Helpers ──────────────────────────────────────────────────────────

function fmt(amount: number): string {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}

/** Safe wrapper: logs errors without crashing the caller */
async function notify(phone: string, message: string): Promise<void> {
  if (!phone) return;
  try {
    await sendWhatsAppText(phone, message);
  } catch (err) {
    console.error(`[Notify] Failed to send to ${phone}:`, err);
  }
}

// ─── Template 1 — Contribution reçue (porteur) ───────────────────────

export async function notifyPorteurContribution(params: {
  porteurPhone: string;
  porteurName: string;
  contributorName: string;   // "Anonyme" si isAnonymous
  amount: number;
  cagnotteTitle: string;
  currentAmount: number;
  targetAmount?: number | null;
  cagnotteSlug: string;
}): Promise<void> {
  const progress = params.targetAmount
    ? `\nProgression : ${fmt(params.currentAmount)} / ${fmt(params.targetAmount)}`
    : `\nTotal collecté : ${fmt(params.currentAmount)}`;

  await notify(
    params.porteurPhone,
    `🎉 *Nouvelle contribution sur votre cagnotte !*\n\n` +
    `• Cagnotte : ${params.cagnotteTitle}\n` +
    `• Montant : *${fmt(params.amount)}*\n` +
    `• De : ${params.contributorName}` +
    progress +
    `\n\n_Voir sur terrabiga.com/c/${params.cagnotteSlug}_`
  );
}

// ─── Template 2 — Confirmation au contributeur ───────────────────────

export async function notifyContributorConfirmed(params: {
  contributorPhone: string;
  amount: number;
  cagnotteTitle: string;
  porteurName: string;
  cagnotteSlug: string;
}): Promise<void> {
  await notify(
    params.contributorPhone,
    `✅ *Contribution confirmée — Terra Biga*\n\n` +
    `Merci pour votre soutien ! 🙏\n\n` +
    `• Montant : *${fmt(params.amount)}*\n` +
    `• Cagnotte : ${params.cagnotteTitle}\n` +
    `• Porteur : ${params.porteurName}\n\n` +
    `_Votre contribution a été directement envoyée au porteur via Orange Money._\n` +
    `Suivre : terrabiga.com/c/${params.cagnotteSlug}`
  );
}

// ─── Template 3 — Objectif de cagnotte atteint ───────────────────────

export async function notifyCagnotteGoalReached(params: {
  porteurPhone: string;
  cagnotteTitle: string;
  targetAmount: number;
  contributorsCount: number;
}): Promise<void> {
  await notify(
    params.porteurPhone,
    `🏆 *Objectif atteint ! Félicitations !*\n\n` +
    `Votre cagnotte *"${params.cagnotteTitle}"* a atteint son objectif de *${fmt(params.targetAmount)}* !\n\n` +
    `• Contributeurs : ${params.contributorsCount} personnes vous ont soutenu(e)\n\n` +
    `Vous pouvez continuer à collecter ou clôturer la cagnotte depuis votre dashboard.\n` +
    `Merci à toute la communauté Terra Biga ! 🌍`
  );
}

// ─── Template 4 — Groupe Te Raga complet (solde dû) ─────────────────

export async function notifyGroupFull(params: {
  customerPhone: string;
  customerName: string;
  productName: string;
  remainingAmount: number;
  orderCode: string;
  deadlineDate: string;  // ex: "20 mars 2026"
}): Promise<void> {
  await notify(
    params.customerPhone,
    `🛒 *Votre groupe Te Raga est complet !*\n\n` +
    `Bonjour ${params.customerName} 👋\n\n` +
    `• Produit : *${params.productName}*\n` +
    `• Solde restant : *${fmt(params.remainingAmount)}*\n` +
    `• Référence : ${params.orderCode}\n\n` +
    `⚠️ Veuillez payer le solde avant le *${params.deadlineDate}* pour valider votre commande.\n\n` +
    `Payer sur : terrabiga.com/te-raga/paiement?code=${params.orderCode}`
  );
}

// ─── Template 5 — Rappel paiement solde Te Raga ──────────────────────

export async function notifyBalanceDue(params: {
  customerPhone: string;
  customerName: string;
  productName: string;
  remainingAmount: number;
  orderCode: string;
}): Promise<void> {
  await notify(
    params.customerPhone,
    `⏰ *Rappel : solde Te Raga en attente*\n\n` +
    `Bonjour ${params.customerName},\n\n` +
    `Votre paiement de solde pour *"${params.productName}"* est toujours en attente.\n\n` +
    `• Montant dû : *${fmt(params.remainingAmount)}*\n` +
    `• Référence : ${params.orderCode}\n\n` +
    `Si le solde n'est pas réglé dans les délais, votre commande sera annulée.\n` +
    `Payer : terrabiga.com/te-raga/paiement?code=${params.orderCode}`
  );
}

// ─── Template 6 — Commande prête à récupérer ─────────────────────────

export async function notifyOrderReady(params: {
  customerPhone: string;
  customerName: string;
  productName: string;
  orderCode: string;
  depotAddress: string;  // ex: "Dépôt ZAD, Quartier Zogona, Ouagadougou"
  openingHours: string;  // ex: "Lun–Sam 8h–18h"
}): Promise<void> {
  await notify(
    params.customerPhone,
    `📦 *Votre commande est prête !*\n\n` +
    `Bonjour ${params.customerName} ! Bonne nouvelle 🎉\n\n` +
    `• Produit : *${params.productName}*\n` +
    `• Référence : ${params.orderCode}\n\n` +
    `📍 *Lieu de retrait :*\n${params.depotAddress}\n` +
    `🕐 Horaires : ${params.openingHours}\n\n` +
    `⚠️ Présentez-vous *avec votre pièce d'identité* et votre numéro de référence.\n\n` +
    `Des questions ? Répondez à ce message.`
  );
}

// ─── Template 7 — Bienvenue + points BIGA ────────────────────────────

export async function notifyWelcome(params: {
  phone: string;
  name?: string;
  welcomePoints: number;   // 50 points
  referralCode: string;
}): Promise<void> {
  const greeting = params.name ? `Bienvenue ${params.name} !` : "Bienvenue sur Terra Biga !";
  await notify(
    params.phone,
    `🌍 *${greeting}*\n\n` +
    `Merci de rejoindre la communauté Terra Biga — Ensemble on va plus loin !\n\n` +
    `🎁 *Cadeau de bienvenue :* +${params.welcomePoints} points BIGA crédités sur votre compte.\n\n` +
    `📣 *Invitez vos proches* et gagnez 200 points BIGA par parrainage !\n` +
    `Votre code parrainage : *${params.referralCode}*\n\n` +
    `Démarrer : terrabiga.com`
  );
}

// ─── Template 8 — Mise à jour porteur (abonnés) ──────────────────────

/**
 * Sends an update notification to a list of contributor phones.
 * Call in a loop or with Promise.allSettled for large lists.
 */
export async function notifyContributorUpdate(params: {
  contributorPhone: string;
  cagnotteTitle: string;
  porteurName: string;
  updateContent: string;   // trimmed to 200 chars for WA
  cagnotteSlug: string;
}): Promise<void> {
  const preview = params.updateContent.length > 200
    ? params.updateContent.slice(0, 197) + "..."
    : params.updateContent;

  await notify(
    params.contributorPhone,
    `📢 *Mise à jour — ${params.cagnotteTitle}*\n\n` +
    `${params.porteurName} vient de publier une mise à jour :\n\n` +
    `_"${preview}"_\n\n` +
    `Voir la cagnotte : terrabiga.com/c/${params.cagnotteSlug}`
  );
}

// ─── Batch helper ─────────────────────────────────────────────────────

/**
 * Send the same cagnotte update to multiple contributors.
 * Uses Promise.allSettled so one failure doesn't block others.
 * Adds a small delay between sends to respect WhatsApp rate limits.
 */
export async function broadcastCagnotteUpdate(params: {
  contributorPhones: string[];
  cagnotteTitle: string;
  porteurName: string;
  updateContent: string;
  cagnotteSlug: string;
}): Promise<{ sent: number; failed: number }> {
  const results = await Promise.allSettled(
    params.contributorPhones.map((phone, i) =>
      new Promise<void>(resolve =>
        setTimeout(async () => {
          await notifyContributorUpdate({
            contributorPhone: phone,
            cagnotteTitle: params.cagnotteTitle,
            porteurName: params.porteurName,
            updateContent: params.updateContent,
            cagnotteSlug: params.cagnotteSlug,
          });
          resolve();
        }, i * 250) // 250ms stagger to avoid WA rate limits
      )
    )
  );

  const sent   = results.filter(r => r.status === "fulfilled").length;
  const failed = results.filter(r => r.status === "rejected").length;
  return { sent, failed };
}
