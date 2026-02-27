/**
 * client/src/pages/CagnottePublic.tsx
 * ─────────────────────────────────────────────────────────────────────
 * Page publique d'une cagnotte accessible via /c/:slug
 * Style GoFundMe / Leetchi :
 *  - Hero photo (si présente) avec overlay dégradé
 *  - Bloc progression sticky sur desktop
 *  - Formulaire de contribution en 2 clics (montant → paiement)
 *  - Mur de contributeurs chronologique + bouton "Remercier via WhatsApp"
 *  - Fil de mises à jour porteur
 *  - Share footer
 */

import Layout from "@/components/Layout";
import ShareCagnotte from "@/components/ShareCagnotte";
import { trpc } from "@/lib/trpc";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft, ArrowRight, Heart, Users, Phone, CheckCircle,
  MessageSquare, Clock, ChevronDown, ChevronUp, Share2, PiggyBank
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { CAGNOTTE_CATEGORIES, PAYMENT_METHODS, SUGGESTED_AMOUNTS } from "@shared/types";

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}
function timeAgo(d: Date | string): string {
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  return `Il y a ${Math.floor(diff / 86400)}j`;
}

export default function CagnottePublic() {
  const [, params] = useRoute("/c/:slug");
  const slug = params?.slug ?? "";

  const cagnotteQuery = trpc.cagnottes.bySlug.useQuery({ slug }, { enabled: !!slug });
  const cagnotte = cagnotteQuery.data;
  const cagnotteId = cagnotte?.id;

  const contributionsQuery = trpc.cagnottes.contributions.useQuery(
    { cagnotteId: cagnotteId! },
    { enabled: !!cagnotteId }
  );
  const updatesQuery = trpc.cagnottes.updates.useQuery(
    { cagnotteId: cagnotteId! },
    { enabled: !!cagnotteId }
  );

  const contributeMutation = trpc.contributions.create.useMutation();
  const paymentMutation = trpc.payments.initiate.useMutation();

  // Contribution form state
  const [step, setStep] = useState<"idle" | "amount" | "details" | "confirmed">("idle");
  const [amount, setAmount] = useState("");
  const [contributorName, setContributorName] = useState("");
  const [contributorPhone, setContributorPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("ussd_orange");

  const formRef = useRef<HTMLDivElement>(null);

  // OG tags
  useEffect(() => {
    if (!cagnotte) return;
    document.title = `${cagnotte.title} — Terra Biga`;
    const percent = cagnotte.targetAmount
      ? Math.min(Math.round((cagnotte.currentAmount / cagnotte.targetAmount) * 100), 100)
      : null;
    const desc = percent != null
      ? `${fmt(cagnotte.currentAmount)} collectés sur ${fmt(cagnotte.targetAmount!)} (${percent}%) — ${cagnotte.contributorsCount} contributeurs.`
      : `${fmt(cagnotte.currentAmount)} collectés — ${cagnotte.contributorsCount} contributeurs.`;
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", cagnotte.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", desc);
    if (cagnotte.imageUrl) {
      document.querySelector('meta[property="og:image"]')?.setAttribute("content", cagnotte.imageUrl);
    }
    return () => { document.title = "Terra Biga — Ensemble on va plus loin"; };
  }, [cagnotte]);

  // ── Handlers ──────────────────────────────────────────────────────
  function handleContributeClick() {
    setStep("amount");
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
  }

  async function handleSubmit() {
    if (!cagnotteId || !amount || !contributorPhone) return;
    const amountNum = parseInt(amount.replace(/\s/g, ""), 10);
    if (!amountNum || amountNum < 100) return;

    await contributeMutation.mutateAsync({
      cagnotteId,
      contributorName: isAnonymous ? undefined : contributorName || undefined,
      contributorPhone,
      amount: amountNum,
      message: message || undefined,
      paymentMethod,
      isAnonymous,
    });

    await paymentMutation.mutateAsync({
      type: "contribution",
      referenceId: cagnotteId,
      amount: amountNum,
      method: paymentMethod as "ussd_orange" | "ussd_moov" | "ligidicash",
      phone: contributorPhone,
    });

    setStep("confirmed");
    contributionsQuery.refetch();
    cagnotteQuery.refetch();
  }

  // ── Loading ───────────────────────────────────────────────────────
  if (cagnotteQuery.isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Skeleton className="h-64 w-full rounded-2xl mb-6" />
          <Skeleton className="h-8 w-3/4 mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </Layout>
    );
  }

  if (!cagnotte) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <PiggyBank className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">Cagnotte introuvable ou non disponible</p>
          <Link href="/ma-cagnotte">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Voir les cagnottes
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const percent = cagnotte.targetAmount
    ? Math.min(Math.round((cagnotte.currentAmount / cagnotte.targetAmount) * 100), 100)
    : null;
  const catInfo = CAGNOTTE_CATEGORIES.find(c => c.key === cagnotte.category);
  const contributions = contributionsQuery.data ?? [];
  const updates = updatesQuery.data ?? [];
  const isPaused = cagnotte.status === "paused";

  // ── Confirmation screen ───────────────────────────────────────────
  if (step === "confirmed") {
    return (
      <Layout>
        <div className="max-w-lg mx-auto px-4 py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Merci ! 🙏</h1>
          <p className="text-muted-foreground mb-6">
            Votre contribution de {fmt(parseInt(amount))} a bien été enregistrée.<br />
            Vous recevrez une confirmation sur WhatsApp.
          </p>
          <div className="bg-orange-50 rounded-2xl p-4 mb-6 text-left">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Aidez la cagnotte en la partageant 👇
            </p>
            <ShareCagnotte cagnotte={cagnotte} variant="button" className="w-full" />
          </div>
          <button
            onClick={() => setStep("idle")}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Retour à la cagnotte
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Back + status badge */}
        <div className="flex items-center gap-3 mb-4">
          <Link href="/ma-cagnotte" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Cagnottes
          </Link>
          {isPaused && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">
              ⏸ En pause
            </span>
          )}
          {cagnotte.status === "completed" && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
              ✅ Clôturée
            </span>
          )}
        </div>

        <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-8">

          {/* ── LEFT COLUMN ── */}
          <div>
            {/* Hero photo */}
            {cagnotte.imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden h-64 sm:h-80 mb-6 bg-gray-100">
                <img
                  src={cagnotte.imageUrl}
                  alt={cagnotte.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm font-medium">
                    {catInfo?.icon} {catInfo?.label}
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl h-40 mb-6 bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                <span className="text-5xl">{catInfo?.icon ?? "🙏"}</span>
              </div>
            )}

            {/* Title + creator */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{cagnotte.title}</h1>
            {cagnotte.creatorName && (
              <p className="text-sm text-muted-foreground mb-4">
                Organisé par <span className="font-medium text-gray-700">{cagnotte.creatorName}</span>
              </p>
            )}

            {/* Progress block — mobile only (desktop in sticky sidebar) */}
            <div className="lg:hidden mb-6">
              <ProgressBlock
                currentAmount={cagnotte.currentAmount}
                targetAmount={cagnotte.targetAmount}
                contributorsCount={cagnotte.contributorsCount}
                percent={percent}
              />
            </div>

            {/* CTA — mobile only */}
            {!isPaused && cagnotte.status !== "completed" && (
              <div className="lg:hidden mb-6">
                <button
                  onClick={handleContributeClick}
                  className="w-full h-14 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg transition"
                >
                  💛 Contribuer maintenant
                </button>
              </div>
            )}

            {/* Story */}
            {cagnotte.description && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-3">À propos de cette cagnotte</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{cagnotte.description}</p>
              </div>
            )}

            {/* Contribution form (appears inline on mobile when CTA clicked) */}
            <div ref={formRef}>
              {(step === "amount" || step === "details") && !isPaused && (
                <ContributeForm
                  step={step}
                  setStep={setStep}
                  amount={amount}
                  setAmount={setAmount}
                  contributorName={contributorName}
                  setContributorName={setContributorName}
                  contributorPhone={contributorPhone}
                  setContributorPhone={setContributorPhone}
                  message={message}
                  setMessage={setMessage}
                  isAnonymous={isAnonymous}
                  setIsAnonymous={setIsAnonymous}
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  onSubmit={handleSubmit}
                  isPending={contributeMutation.isPending || paymentMutation.isPending}
                />
              )}
            </div>

            {/* Contributor wall */}
            <ContributorWall contributions={contributions} />

            {/* Updates feed */}
            {updates.length > 0 && (
              <UpdatesFeed updates={updates} />
            )}
          </div>

          {/* ── RIGHT COLUMN (sticky sidebar, desktop only) ── */}
          <div className="hidden lg:block">
            <div className="sticky top-6 space-y-4">
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                <ProgressBlock
                  currentAmount={cagnotte.currentAmount}
                  targetAmount={cagnotte.targetAmount}
                  contributorsCount={cagnotte.contributorsCount}
                  percent={percent}
                />
                {!isPaused && cagnotte.status !== "completed" && (
                  <button
                    onClick={handleContributeClick}
                    className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition mt-4"
                  >
                    💛 Contribuer maintenant
                  </button>
                )}
                {isPaused && (
                  <p className="text-center text-sm text-yellow-600 bg-yellow-50 rounded-xl p-3 mt-4">
                    Cette cagnotte est temporairement en pause.
                  </p>
                )}
              </div>

              {/* Share box */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-orange-500" /> Partager cette cagnotte
                </p>
                <ShareCagnotte cagnotte={cagnotte} variant="button" className="w-full" />
              </div>

              {/* Inline form on desktop */}
              {(step === "amount" || step === "details") && !isPaused && (
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                  <ContributeForm
                    step={step}
                    setStep={setStep}
                    amount={amount}
                    setAmount={setAmount}
                    contributorName={contributorName}
                    setContributorName={setContributorName}
                    contributorPhone={contributorPhone}
                    setContributorPhone={setContributorPhone}
                    message={message}
                    setMessage={setMessage}
                    isAnonymous={isAnonymous}
                    setIsAnonymous={setIsAnonymous}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    onSubmit={handleSubmit}
                    isPending={contributeMutation.isPending || paymentMutation.isPending}
                  />
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────

function ProgressBlock({ currentAmount, targetAmount, contributorsCount, percent }: {
  currentAmount: number;
  targetAmount?: number | null;
  contributorsCount: number;
  percent: number | null;
}) {
  return (
    <div>
      <div className="text-3xl font-bold text-green-600 mb-1">{fmt(currentAmount)}</div>
      {targetAmount && (
        <p className="text-sm text-muted-foreground mb-3">
          collectés sur <span className="font-medium text-gray-700">{fmt(targetAmount)}</span>
        </p>
      )}
      {percent !== null && (
        <Progress value={percent} className="h-2.5 mb-3 rounded-full" />
      )}
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Users className="w-4 h-4" />
        <span className="font-medium text-gray-700">{contributorsCount}</span>
        {contributorsCount <= 1 ? " contributeur" : " contributeurs"}
        {percent !== null && (
          <span className="ml-auto font-semibold text-green-600">{percent}%</span>
        )}
      </div>
    </div>
  );
}

function ContributeForm({
  step, setStep, amount, setAmount, contributorName, setContributorName,
  contributorPhone, setContributorPhone, message, setMessage,
  isAnonymous, setIsAnonymous, paymentMethod, setPaymentMethod,
  onSubmit, isPending,
}: {
  step: "amount" | "details";
  setStep: (s: "idle" | "amount" | "details") => void;
  amount: string; setAmount: (v: string) => void;
  contributorName: string; setContributorName: (v: string) => void;
  contributorPhone: string; setContributorPhone: (v: string) => void;
  message: string; setMessage: (v: string) => void;
  isAnonymous: boolean; setIsAnonymous: (v: boolean) => void;
  paymentMethod: string; setPaymentMethod: (v: string) => void;
  onSubmit: () => void; isPending: boolean;
}) {
  const amountNum = parseInt(amount.replace(/\s/g, ""), 10);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-base">
          {step === "amount" ? "Choisissez un montant" : "Vos informations"}
        </h3>
        <button onClick={() => setStep("idle")} className="text-xs text-muted-foreground hover:text-gray-600">
          Annuler
        </button>
      </div>

      {/* Step 1: Amount */}
      {step === "amount" && (
        <>
          <div className="grid grid-cols-4 gap-2">
            {SUGGESTED_AMOUNTS.map(a => (
              <button
                key={a}
                onClick={() => setAmount(String(a))}
                className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  amount === String(a)
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-gray-700 border-gray-200 hover:border-orange-300"
                }`}
              >
                {new Intl.NumberFormat("fr-FR").format(a)}
              </button>
            ))}
          </div>
          <Input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="Autre montant (FCFA)"
            className="h-12 rounded-xl"
            min={100}
          />
          <Button
            onClick={() => setStep("details")}
            disabled={!amountNum || amountNum < 100}
            className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold"
          >
            Continuer — {amountNum ? fmt(amountNum) : ""}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </>
      )}

      {/* Step 2: Details + payment */}
      {step === "details" && (
        <>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Montant</span>
            <button onClick={() => setStep("amount")} className="font-semibold text-orange-500 hover:text-orange-600">
              {fmt(amountNum)} ✎
            </button>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm">Contribution anonyme</Label>
            <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
          </div>

          {!isAnonymous && (
            <Input
              value={contributorName}
              onChange={e => setContributorName(e.target.value)}
              placeholder="Votre nom (optionnel)"
              className="h-11 rounded-xl"
            />
          )}

          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="tel"
              value={contributorPhone}
              onChange={e => setContributorPhone(e.target.value)}
              placeholder="Numéro de téléphone *"
              className="h-11 rounded-xl pl-10"
            />
          </div>

          <Input
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Un mot d'encouragement... (optionnel)"
            className="h-11 rounded-xl"
          />

          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Paiement</p>
            {PAYMENT_METHODS.map(m => (
              <button
                key={m.key}
                onClick={() => setPaymentMethod(m.key)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  paymentMethod === m.key
                    ? "ring-2 ring-orange-400 border-orange-400 bg-orange-50"
                    : "border-gray-200 hover:border-orange-200"
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                  paymentMethod === m.key ? "border-orange-400" : "border-gray-300"
                }`}>
                  {paymentMethod === m.key && <div className="w-2 h-2 rounded-full bg-orange-400" />}
                </div>
                <div>
                  <p className="text-sm font-medium">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{m.description}</p>
                </div>
                {m.recommended && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-600 font-semibold">
                    Recommandé
                  </span>
                )}
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-400 text-center">
            En contribuant, j'accepte les{" "}
            <a href="/cgu" className="underline">CGU</a> de Terra Biga
          </p>

          <Button
            onClick={onSubmit}
            disabled={isPending || !contributorPhone}
            className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold"
          >
            {isPending ? "Traitement..." : `Contribuer ${fmt(amountNum)}`}
            {!isPending && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </>
      )}
    </div>
  );
}

function ContributorWall({ contributions }: { contributions: any[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? contributions : contributions.slice(0, 5);

  function thankViaWhatsApp(phone: string, name: string) {
    const msg = encodeURIComponent(`Bonjour ${name || ""}! Merci infiniment pour votre contribution à ma cagnotte Terra Biga. Votre soutien me touche vraiment. 🙏`);
    window.open(`https://wa.me/${phone.replace(/\D/g, "")}?text=${msg}`, "_blank");
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Heart className="w-5 h-5 text-orange-500" />
        Contributeurs ({contributions.length})
      </h2>
      {contributions.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-gray-200 rounded-2xl">
          <Heart className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Aucune contribution pour le moment.</p>
          <p className="text-xs text-muted-foreground">Soyez le premier à soutenir cette cagnotte !</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map((c, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100 hover:border-orange-100 transition group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-600">
                  {(c.isAnonymous ? "?" : (c.contributorName?.[0] ?? "?")).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {c.isAnonymous ? "Anonyme" : c.contributorName || "Contributeur"}
                  </p>
                  {c.message && (
                    <p className="text-xs text-muted-foreground italic">"{c.message}"</p>
                  )}
                  <p className="text-xs text-muted-foreground">{timeAgo(c.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-green-600">{fmt(c.amount)}</span>
                {!c.isAnonymous && c.contributorPhone && (
                  <button
                    onClick={() => thankViaWhatsApp(c.contributorPhone, c.contributorName)}
                    className="opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 text-xs"
                    title="Remercier via WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {contributions.length > 5 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-orange-500 py-2 transition"
            >
              {expanded ? (
                <><ChevronUp className="w-4 h-4" /> Voir moins</>
              ) : (
                <><ChevronDown className="w-4 h-4" /> Voir les {contributions.length - 5} autres</>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function UpdatesFeed({ updates }: { updates: any[] }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-orange-500" />
        Mises à jour ({updates.length})
      </h2>
      <div className="space-y-4">
        {updates.map((u, i) => (
          <div key={i} className="bg-orange-50/50 border border-orange-100 rounded-2xl p-4">
            {u.imageUrl && (
              <img
                src={u.imageUrl}
                alt="Mise à jour"
                className="w-full rounded-xl mb-3 max-h-48 object-cover"
              />
            )}
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">{u.content}</p>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {timeAgo(u.createdAt)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
