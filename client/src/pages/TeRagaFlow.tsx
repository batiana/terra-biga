import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { useRoute, useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, ArrowRight, ShoppingCart, Shield, Smartphone,
  CheckCircle, MapPin, Phone, User, FileText, CreditCard, TrendingDown
} from "lucide-react";
import { useState } from "react";
import { PAYMENT_METHODS } from "@shared/types";

function formatFCFA(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

// ─── Join Group Page (with Identity form integrated) ────────────────
export function JoinGroup() {
  const [, params] = useRoute("/te-raga/groupe/:groupId");
  const groupId = Number(params?.groupId);
  const [, navigate] = useLocation();

  const groupQuery = trpc.groups.byId.useQuery({ id: groupId }, { enabled: !!groupId });
  const productQuery = trpc.products.byId.useQuery(
    { id: groupQuery.data?.productId ?? 0 },
    { enabled: !!groupQuery.data?.productId }
  );

  // Contact info
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  // Identity info (integrated)
  const [fullName, setFullName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [docType, setDocType] = useState("cni");
  const [docNumber, setDocNumber] = useState("");

  const identityMutation = trpc.identity.submit.useMutation();

  const product = productQuery.data;
  const group = groupQuery.data;

  if (groupQuery.isLoading || productQuery.isLoading) {
    return <Layout><div className="container py-6"><Skeleton className="h-48" /></div></Layout>;
  }

  const advanceAmount = product ? Math.round(product.groupPrice * 0.1) : 0;
  const savings = product ? product.standardPrice - product.groupPrice : 0;

  const canSubmit = phone.length >= 8 && fullName.length >= 2 && firstName.length >= 1 && docNumber.length >= 3;

  const handleSubmit = async () => {
    // Submit identity
    await identityMutation.mutateAsync({
      fullName,
      firstName,
      documentType: docType as "cni" | "passport" | "permit",
      documentNumber: docNumber,
      phone,
    });
    // Navigate to payment
    navigate(`/te-raga/paiement?groupId=${groupId}&productId=${product?.id}&phone=${phone}&name=${fullName}`);
  };

  return (
    <Layout>
      <div className="container py-6 sm:py-10 max-w-lg mx-auto">
        <Link href={product ? `/te-raga/${product.slug}` : "/te-raga"} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        <h1 className="text-xl sm:text-2xl font-bold mb-4">Rejoindre le groupe</h1>

        {/* Product summary */}
        {product && (
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm mb-6">
            <h3 className="font-semibold text-foreground mb-1">{product.name}</h3>
            <div className="flex items-center gap-2 text-sm mb-2">
              <span className="text-muted-foreground line-through">{formatFCFA(product.standardPrice)}</span>
              <span className="font-bold text-tb-green">{formatFCFA(product.groupPrice)}</span>
            </div>
            {savings > 0 && (
              <div className="flex items-center gap-2 text-sm text-tb-green bg-tb-green/5 rounded-lg px-3 py-1.5">
                <TrendingDown className="w-4 h-4" />
                <span className="font-medium">Vous économisez {formatFCFA(savings)} ({product.discount}%)</span>
              </div>
            )}
            {group && (
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{group.currentMembers}/{group.maxMembers} membres</span>
                  <span className="text-tb-green font-medium">{Math.round((group.currentMembers / group.maxMembers) * 100)}%</span>
                </div>
                <Progress value={(group.currentMembers / group.maxMembers) * 100} className="h-2" />
              </div>
            )}
          </div>
        )}

        {/* Combined form: contact + identity */}
        <div className="space-y-5">
          {/* Section 1: Coordonnées */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-tb-green" />
              Vos coordonnées
            </h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="phone" className="mb-1.5 text-sm">Numéro de téléphone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="70 00 00 00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="name" className="mb-1.5 text-sm">Prénom courant (optionnel)</Label>
                <Input
                  id="name"
                  placeholder="Votre prénom"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pièce d'identité */}
          <div>
            <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
              <FileText className="w-4 h-4 text-tb-orange" />
              Pièce d'identité
            </h3>
            <p className="text-xs text-muted-foreground mb-3">Obligatoire pour la collecte de votre commande au dépôt</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1.5 text-sm">Nom complet *</Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-12 rounded-xl"
                    placeholder="Nom complet"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 text-sm">Prénom *</Label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-12 rounded-xl"
                    placeholder="Prénom"
                  />
                </div>
              </div>
              <div>
                <Label className="mb-1.5 text-sm">Type de document *</Label>
                <Select value={docType} onValueChange={setDocType}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cni">Carte Nationale d'Identité</SelectItem>
                    <SelectItem value="passport">Passeport</SelectItem>
                    <SelectItem value="permit">Permis de conduire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 text-sm">Numéro du document *</Label>
                <Input
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="h-12 rounded-xl"
                  placeholder="Numéro de votre pièce"
                />
              </div>
            </div>
          </div>

          {/* Security notice */}
          <div className="bg-tb-green/5 rounded-xl p-3 flex items-start gap-2 text-sm text-muted-foreground">
            <Shield className="w-5 h-5 text-tb-green shrink-0 mt-0.5" />
            <span>Vos données sont chiffrées et sécurisées. Elles sont utilisées uniquement pour la vérification lors de la collecte au dépôt.</span>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || identityMutation.isPending}
            className="w-full bg-tb-green hover:bg-tb-green/90 text-white h-12 rounded-xl text-base gap-2"
          >
            {identityMutation.isPending ? "Envoi..." : "Continuer vers le paiement"} <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </Layout>
  );
}

// ─── Identity Form Page (kept for backward compat, redirects to JoinGroup) ──
export function IdentityForm() {
  return (
    <Layout>
      <div className="container py-16 text-center">
        <p className="text-muted-foreground mb-4">La vérification d'identité est maintenant intégrée dans la page "Rejoindre le groupe".</p>
        <Link href="/te-raga">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour au catalogue
          </Button>
        </Link>
      </div>
    </Layout>
  );
}

// ─── Payment Page ────────────────────────────────────────────────────
export function PaymentPage() {
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const groupId = Number(searchParams.get("groupId") || "0");
  const productId = Number(searchParams.get("productId") || "0");
  const phone = searchParams.get("phone") || "";
  const name = searchParams.get("name") || "";

  const productQuery = trpc.products.byId.useQuery({ id: productId }, { enabled: !!productId });
  const [paymentMethod, setPaymentMethod] = useState("ussd_orange");
  const [donBigaConnect, setDonBigaConnect] = useState(false);

  const orderMutation = trpc.orders.create.useMutation();
  const paymentMutation = trpc.payments.initiate.useMutation();

  const product = productQuery.data;
  const advanceAmount = product ? Math.round(product.groupPrice * 0.1) : 0;
  const savings = product ? product.standardPrice - product.groupPrice : 0;

  const handlePay = async () => {
    if (!product) return;
    const order = await orderMutation.mutateAsync({
      groupId,
      productId,
      customerPhone: phone,
      customerName: name,
      paymentMethod,
    });

    await paymentMutation.mutateAsync({
      type: "advance",
      referenceId: order.id,
      amount: advanceAmount,
      method: paymentMethod as "ussd_orange" | "ussd_moov" | "ligidicash",
      phone,
    });

    navigate(`/te-raga/confirmation?code=${order.orderCode}`);
  };

  return (
    <Layout>
      <div className="container py-6 sm:py-10 max-w-lg mx-auto">
        <Link href="/te-raga" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        <h1 className="text-xl sm:text-2xl font-bold mb-6">Paiement</h1>

        {product && (
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm mb-6">
            <h3 className="font-semibold mb-2">{product.name}</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prix groupé</span>
                <span className="font-semibold">{formatFCFA(product.groupPrice)}</span>
              </div>
              <div className="flex justify-between text-tb-green">
                <span>Avance 10% à payer maintenant</span>
                <span className="font-bold">{formatFCFA(advanceAmount)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Solde 90% à la collecte</span>
                <span>{formatFCFA(product.groupPrice - advanceAmount)}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-tb-green bg-tb-green/5 rounded-lg px-2 py-1 mt-2">
                  <span className="flex items-center gap-1"><TrendingDown className="w-3 h-3" /> Économie</span>
                  <span className="font-bold">{formatFCFA(savings)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <h3 className="font-semibold mb-3">Choisissez votre méthode de paiement</h3>
        <div className="space-y-3 mb-6">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.key}
              onClick={() => setPaymentMethod(method.key)}
              className={`w-full rounded-2xl border bg-white p-4 flex items-start gap-3 text-left transition-all shadow-sm ${
                paymentMethod === method.key ? "ring-2 ring-tb-green border-tb-green" : "border-border"
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                paymentMethod === method.key ? "border-tb-green" : "border-border"
              }`}>
                {paymentMethod === method.key && <div className="w-2.5 h-2.5 rounded-full bg-tb-green" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{method.label}</span>
                  {method.recommended && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-tb-orange/10 text-tb-orange font-semibold">Recommandé</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{method.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Don BIGA CONNECT option */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={donBigaConnect}
              onChange={(e) => setDonBigaConnect(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-border text-tb-blue accent-tb-blue"
            />
            <div>
              <span className="font-semibold text-sm text-foreground">Don BIGA CONNECT</span>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ajoutez un don de 100 FCFA pour soutenir les projets communautaires. 100% reversé aux bénéficiaires.
              </p>
            </div>
          </label>
        </div>

        <Button
          onClick={handlePay}
          disabled={orderMutation.isPending || paymentMutation.isPending}
          className="w-full bg-tb-green hover:bg-tb-green/90 text-white h-12 rounded-xl text-base gap-2"
        >
          {orderMutation.isPending || paymentMutation.isPending ? "Traitement..." : `Payer ${formatFCFA(advanceAmount + (donBigaConnect ? 100 : 0))}`}
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </Layout>
  );
}

// ─── Confirmation Page ───────────────────────────────────────────────
export function ConfirmationPage() {
  const searchParams = new URLSearchParams(window.location.search);
  const code = searchParams.get("code") || "";
  const orderQuery = trpc.orders.byCode.useQuery({ code }, { enabled: !!code });
  const order = orderQuery.data;

  return (
    <Layout>
      <div className="container py-10 sm:py-16 max-w-lg mx-auto text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-tb-green/10 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-tb-green" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Votre commande est confirmée !</h1>

        {order && (
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm text-left mt-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Code commande</span>
              <span className="font-mono font-bold text-tb-green">{order.orderCode}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Montant payé (avance)</span>
              <span className="font-semibold">{formatFCFA(order.advanceAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Solde restant</span>
              <span className="font-semibold">{formatFCFA(order.remainingAmount)}</span>
            </div>
            <div className="border-t pt-3 space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-tb-orange" /> Dépôt Terra Biga — ZAD, Ouagadougou</p>
              <p className="flex items-center gap-2"><Smartphone className="w-4 h-4 text-tb-blue" /> Vous recevrez un SMS quand votre commande sera prête</p>
              <p className="flex items-center gap-2"><FileText className="w-4 h-4" /> Présentez votre pièce d'identité lors du retrait</p>
              <p className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Le solde de {formatFCFA(order.remainingAmount)} (90%) sera réglé sur place</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto rounded-xl gap-2">
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
