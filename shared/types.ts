/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// ─── Product Categories ──────────────────────────────────────────────
export const PRODUCT_CATEGORIES = [
  { key: "rentree", label: "Rentrée scolaire", icon: "🎒" },
  { key: "ramadan", label: "Ramadan & Fêtes", icon: "🌙" },
  { key: "hivernage", label: "Hivernage", icon: "🌧️" },
  { key: "solaire", label: "Énergie solaire", icon: "☀️" },
  { key: "quotidien", label: "Quotidien", icon: "🏠" },
] as const;

// ─── Cagnotte Categories ─────────────────────────────────────────────
export const CAGNOTTE_CATEGORIES = [
  { key: "mariage", label: "Mariage / Baptême", icon: "💍" },
  { key: "anniversaire", label: "Anniversaire", icon: "🎂" },
  { key: "cadeau", label: "Cadeau collectif", icon: "🎁" },
  { key: "famille", label: "Soutien familial", icon: "👨‍👩‍👧‍👦" },
  { key: "education", label: "Éducation", icon: "📚" },
  { key: "construction", label: "Construction / Rénovation", icon: "🏗️" },
  { key: "voyage", label: "Voyage / Formation", icon: "✈️" },
  { key: "obseques", label: "Obsèques / Rapatriement", icon: "⚰️" },
  { key: "autre", label: "Autre projet", icon: "📋" },
  { key: "sante", label: "Santé", icon: "🏥", notice: "Validation sous 24-48h" },
  { key: "association_ong", label: "Association / ONG", icon: "🏢", notice: "Validation sous 48-72h" },
] as const;

// ─── Carrier Types ───────────────────────────────────────────────────
export const CARRIER_TYPES = [
  { key: "individuel", label: "Individuel", icon: "👤" },
  { key: "groupe", label: "Groupe / Famille", icon: "👥" },
  { key: "association", label: "Association", icon: "🏢" },
  { key: "ong", label: "ONG", icon: "🌍" },
  { key: "collectif", label: "Collectif / Communauté", icon: "🏛️" },
] as const;

// ─── Points System ───────────────────────────────────────────────────
export const POINT_ACTIONS = {
  welcome: { points: 50, label: "Bienvenue" },
  order_completed: { points: 100, label: "Achat groupé finalisé" },
  contribution: { points: 25, label: "Contribution cagnotte" },
  share: { points: 10, label: "Partage WhatsApp/SMS" },
  referral: { points: 200, label: "Parrainage" },
  donation: { points: 50, label: "Don BIGA CONNECT" },
  cagnotte_created: { points: 25, label: "Création cagnotte" },
} as const;

export const LEVELS = [
  { key: "bronze", label: "Bronze", icon: "🥉", minPoints: 0, benefits: "Accès de base" },
  { key: "silver", label: "Argent", icon: "🥈", minPoints: 500, benefits: "Priorité collecte" },
  { key: "gold", label: "Or", icon: "🥇", minPoints: 2000, benefits: "Réductions exclusives" },
  { key: "platinum", label: "Platine", icon: "💎", minPoints: 5000, benefits: "Avantages VIP" },
] as const;

// ─── Payment Methods ─────────────────────────────────────────────────
export const PAYMENT_METHODS = [
  { key: "ussd_orange", label: "Orange Money (USSD)", recommended: true, description: "Fonctionne sans internet, sur tout téléphone" },
  { key: "ussd_moov", label: "Moov Money (USSD)", recommended: false, description: "Fonctionne sans internet, sur tout téléphone" },
  { key: "ligidicash", label: "Ligidicash (OTP)", recommended: false, description: "Paiement sécurisé par code OTP" },
] as const;

// ─── Suggested Amounts ───────────────────────────────────────────────
export const SUGGESTED_AMOUNTS = [1000, 2500, 5000, 10000] as const;
export const SUGGESTED_DONATION_AMOUNTS = [500, 1000, 2500, 5000, 10000] as const;

// ─── Format Helpers ──────────────────────────────────────────────────
export function formatFCFA(amount: number): string {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}

export function formatPercent(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(Math.round((value / total) * 100), 100);
}
