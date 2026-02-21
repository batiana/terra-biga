import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { useRoute, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft, ArrowRight, PiggyBank, Users, Share2, CheckCircle,
  Heart, Smartphone, Phone
} from "lucide-react";
import { useState } from "react";
import { CAGNOTTE_CATEGORIES, PAYMENT_METHODS, SUGGESTED_AMOUNTS } from "@shared/types";

function formatFCFA(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

export default function CagnotteDetail() {
  const [, params] = useRoute("/ma-cagnotte/:id");
  const cagnotteId = Number(params?.id);
  const [, navigate] = useLocation();

  const cagnotteQuery = trpc.cagnottes.byId.useQuery({ id: cagnotteId }, { enabled: !!cagnotteId });
  const contributionsQuery = trpc.cagnottes.contributions.useQuery({ cagnotteId }, { enabled: !!cagnotteId });

  const [showContributeForm, setShowContributeForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [contributorName, setContributorName] = useState("");
  const [contributorPhone, setContributorPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("ussd_orange");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const contributeMutation = trpc.contributions.create.useMutation();
  const paymentMutation = trpc.payments.initiate.useMutation();

  const cagnotte = cagnotteQuery.data;
  const contributions = contributionsQuery.data || [];

  if (cagnotteQuery.isLoading) {
    return (
      <Layout>
        <div className="container py-6 max-w-lg mx-auto">
          <Skeleton className="h-6 w-3/4 mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-3 w-full mb-4" />
          <Skeleton className="h-40 w-full" />
        </div>
      </Layout>
    );
  }

  if (!cagnotte) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <PiggyBank className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">Cagnotte introuvable</p>
          <Link href="/ma-cagnotte">
            <Button variant="outline" className="gap-2"><ArrowLeft className="w-4 h-4" /> Retour</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const percent = cagnotte.targetAmount > 0
    ? Math.min(Math.round((cagnotte.currentAmount / cagnotte.targetAmount) * 100), 100)
    : 0;
  const catInfo = CAGNOTTE_CATEGORIES.find((c) => c.key === cagnotte.category);

  const handleContribute = async () => {
    const amountNum = parseInt(amount.replace(/\s/g, ""), 10);
    if (!amountNum || amountNum < 100 || !contributorPhone) return;

    await contributeMutation.mutateAsync({
      cagnotteId,
      contributorName: isAnonymous ? undefined : contributorName,
      contributorPhone,
      amount: amountNum,
      message,
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

    setShowConfirmation(true);
    setShowContributeForm(false);
  };

  const handleShare = () => {
    const url = window.location.href;
    const text = `Contribuez à "${cagnotte.title}" sur Terra Biga : ${url}`;
    if (navigator.share) {
      navigator.share({ title: cagnotte.title, text, url });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  if (showConfirmation) {
    return (
      <Layout>
        <div className="container py-10 sm:py-16 max-w-lg mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-tb-green/10 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-tb-green" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Merci pour votre contribution !</h1>
          <p className="text-muted-foreground mb-6">Votre contribution de {formatFCFA(parseInt(amount))} a été enregistrée.</p>
          <div className="flex flex-col gap-3">
            <Button onClick={handleShare} variant="outline" className="gap-2 rounded-xl">
              <Share2 className="w-4 h-4" /> Partager la cagnotte
            </Button>
            <Link href="/ma-cagnotte">
              <Button variant="outline" className="w-full gap-2 rounded-xl">
                <ArrowLeft className="w-4 h-4" /> Retour aux cagnottes
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6 sm:py-10 max-w-2xl mx-auto">
        <Link href="/ma-cagnotte" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        {/* Header */}
        <div className="mb-4">
          <span className="text-xs px-2 py-0.5 rounded-full bg-tb-blue/10 text-tb-blue font-medium">
            {catInfo?.icon} {catInfo?.label || cagnotte.category}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{cagnotte.title}</h1>
        {cagnotte.description && (
          <p className="text-muted-foreground mb-4">{cagnotte.description}</p>
        )}
        {cagnotte.creatorName && (
          <p className="text-sm text-muted-foreground mb-4">Par {cagnotte.creatorName}</p>
        )}

        {/* Progress */}
        <div className="tb-card mb-6">
          <div className="flex justify-between items-end mb-2">
            <div>
              <span className="text-2xl font-bold text-tb-green">{formatFCFA(cagnotte.currentAmount)}</span>
              <span className="text-sm text-muted-foreground ml-2">sur {formatFCFA(cagnotte.targetAmount)}</span>
            </div>
            <span className="text-lg font-bold text-tb-green">{percent}%</span>
          </div>
          <Progress value={percent} className="h-3 mb-2" />
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {cagnotte.contributorsCount} contributeurs</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          <Button
            onClick={() => setShowContributeForm(!showContributeForm)}
            className="flex-1 bg-tb-blue hover:bg-tb-blue/90 text-white h-12 rounded-xl text-base gap-2"
          >
            <Heart className="w-5 h-5" /> Contribuer
          </Button>
          <Button onClick={handleShare} variant="outline" className="h-12 rounded-xl gap-2 border-tb-blue text-tb-blue">
            <Share2 className="w-5 h-5" /> Partager
          </Button>
        </div>

        {/* Contribute Form */}
        {showContributeForm && (
          <div className="tb-card mb-6 space-y-4">
            <h3 className="font-semibold text-lg">Contribuer à cette cagnotte</h3>

            {/* Suggested amounts */}
            <div>
              <Label className="mb-2">Montant (FCFA) *</Label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {SUGGESTED_AMOUNTS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAmount(String(a))}
                    className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                      amount === String(a) ? "bg-tb-blue text-white border-tb-blue" : "bg-white text-foreground border-border hover:border-tb-blue/50"
                    }`}
                  >
                    {new Intl.NumberFormat("fr-FR").format(a)}
                  </button>
                ))}
              </div>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Autre montant"
                className="h-12 rounded-xl"
                min={100}
              />
            </div>

            {/* Anonymous toggle */}
            <div className="flex items-center justify-between">
              <Label>Contribution anonyme</Label>
              <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
            </div>

            {!isAnonymous && (
              <div>
                <Label className="mb-1.5">Votre nom</Label>
                <Input
                  value={contributorName}
                  onChange={(e) => setContributorName(e.target.value)}
                  placeholder="Votre nom"
                  className="h-12 rounded-xl"
                />
              </div>
            )}

            <div>
              <Label className="mb-1.5 flex items-center gap-2"><Phone className="w-4 h-4" /> Numéro de téléphone *</Label>
              <Input
                type="tel"
                value={contributorPhone}
                onChange={(e) => setContributorPhone(e.target.value)}
                placeholder="70 00 00 00"
                className="h-12 rounded-xl"
              />
            </div>

            <div>
              <Label className="mb-1.5">Message (optionnel)</Label>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Un petit mot d'encouragement..."
                className="h-12 rounded-xl"
              />
            </div>

            {/* Payment Method */}
            <div>
              <Label className="mb-2">Méthode de paiement</Label>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.key}
                    onClick={() => setPaymentMethod(method.key)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      paymentMethod === method.key ? "ring-2 ring-tb-blue border-tb-blue" : "border-border"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      paymentMethod === method.key ? "border-tb-blue" : "border-border"
                    }`}>
                      {paymentMethod === method.key && <div className="w-2 h-2 rounded-full bg-tb-blue" />}
                    </div>
                    <div>
                      <span className="text-sm font-medium">{method.label}</span>
                      {method.recommended && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-tb-orange/10 text-tb-orange font-semibold">Recommandé</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleContribute}
              disabled={!amount || parseInt(amount) < 100 || !contributorPhone || contributeMutation.isPending}
              className="w-full bg-tb-blue hover:bg-tb-blue/90 text-white h-12 rounded-xl text-base gap-2"
            >
              {contributeMutation.isPending ? "Traitement..." : `Contribuer ${amount ? formatFCFA(parseInt(amount)) : ""}`}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Contributions List */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Contributions récentes</h3>
          {contributions.length > 0 ? (
            <div className="space-y-2">
              {contributions.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-tb-blue/10 flex items-center justify-center">
                      <Heart className="w-4 h-4 text-tb-blue" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{c.isAnonymous ? "Anonyme" : c.contributorName || "Contributeur"}</p>
                      {c.message && <p className="text-xs text-muted-foreground">{c.message}</p>}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-tb-green">{formatFCFA(c.amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">Aucune contribution pour le moment. Soyez le premier !</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
