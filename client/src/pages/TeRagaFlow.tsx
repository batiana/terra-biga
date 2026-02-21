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
  CheckCircle, MapPin, Phone, User, FileText, CreditCard
} from "lucide-react";
import { useState } from "react";
import { PAYMENT_METHODS } from "@shared/types";

function formatFCFA(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

// ─── Join Group Page ─────────────────────────────────────────────────
export function JoinGroup() {
  const [, params] = useRoute("/te-raga/groupe/:groupId");
  const groupId = Number(params?.groupId);
  const [, navigate] = useLocation();

  const groupQuery = trpc.groups.byId.useQuery({ id: groupId }, { enabled: !!groupId });
  const productQuery = trpc.products.byId.useQuery(
    { id: groupQuery.data?.productId ?? 0 },
    { enabled: !!groupQuery.data?.productId }
  );

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  const product = productQuery.data;
  const group = groupQuery.data;

  if (groupQuery.isLoading || productQuery.isLoading) {
    return <Layout><div className="container py-6"><Skeleton className="h-48" /></div></Layout>;
  }

  return (
    <Layout>
      <div className="container py-6 sm:py-10 max-w-lg mx-auto">
        <Link href="/te-raga" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        <h1 className="text-xl sm:text-2xl font-bold mb-4">Rejoindre le groupe</h1>

        {product && (
          <div className="tb-card mb-6">
            <h3 className="font-semibold text-foreground mb-1">{product.name}</h3>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground line-through">{formatFCFA(product.standardPrice)}</span>
              <span className="font-bold text-tb-green">{formatFCFA(product.groupPrice)}</span>
            </div>
            {group && (
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{group.currentMembers}/{group.maxMembers} membres</span>
                </div>
                <Progress value={(group.currentMembers / group.maxMembers) * 100} className="h-2" />
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="phone" className="flex items-center gap-2 mb-1.5">
              <Phone className="w-4 h-4" /> Numéro de téléphone *
            </Label>
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
            <Label htmlFor="name" className="flex items-center gap-2 mb-1.5">
              <User className="w-4 h-4" /> Prénom (optionnel)
            </Label>
            <Input
              id="name"
              placeholder="Votre prénom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>

          <Button
            onClick={() => navigate(`/te-raga/identite?groupId=${groupId}&productId=${product?.id}&phone=${phone}&name=${name}`)}
            disabled={phone.length < 8}
            className="w-full bg-tb-green hover:bg-tb-green/90 text-white h-12 rounded-xl text-base gap-2"
          >
            Continuer <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </Layout>
  );
}

// ─── Identity Form Page ──────────────────────────────────────────────
export function IdentityForm() {
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const groupId = searchParams.get("groupId") || "";
  const productId = searchParams.get("productId") || "";
  const phoneParam = searchParams.get("phone") || "";
  const nameParam = searchParams.get("name") || "";

  const [fullName, setFullName] = useState(nameParam);
  const [firstName, setFirstName] = useState("");
  const [docType, setDocType] = useState("cni");
  const [docNumber, setDocNumber] = useState("");
  const [phone, setPhone] = useState(phoneParam);

  const identityMutation = trpc.identity.submit.useMutation();

  const handleSubmit = async () => {
    await identityMutation.mutateAsync({
      fullName,
      firstName,
      documentType: docType as "cni" | "passport" | "permit",
      documentNumber: docNumber,
      phone,
    });
    navigate(`/te-raga/paiement?groupId=${groupId}&productId=${productId}&phone=${phone}&name=${fullName}`);
  };

  return (
    <Layout>
      <div className="container py-6 sm:py-10 max-w-lg mx-auto">
        <Link href="/te-raga" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        <h1 className="text-xl sm:text-2xl font-bold mb-2">Vérification d'identité</h1>
        <p className="text-sm text-muted-foreground mb-6">Obligatoire pour la collecte de votre commande</p>

        <div className="space-y-4">
          <div>
            <Label className="mb-1.5">Nom complet *</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-12 rounded-xl" placeholder="Nom complet" />
          </div>
          <div>
            <Label className="mb-1.5">Prénom *</Label>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-12 rounded-xl" placeholder="Prénom" />
          </div>
          <div>
            <Label className="mb-1.5">Type de document *</Label>
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
            <Label className="mb-1.5">Numéro du document *</Label>
            <Input value={docNumber} onChange={(e) => setDocNumber(e.target.value)} className="h-12 rounded-xl" placeholder="Numéro" />
          </div>
          <div>
            <Label className="mb-1.5">Numéro de téléphone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12 rounded-xl" placeholder="70 00 00 00" />
          </div>

          <div className="bg-tb-green/5 rounded-xl p-3 flex items-start gap-2 text-sm text-muted-foreground">
            <Shield className="w-5 h-5 text-tb-green shrink-0 mt-0.5" />
            <span>Vos données sont chiffrées et sécurisées. Elles sont utilisées uniquement pour la vérification lors de la collecte.</span>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!fullName || !firstName || !docNumber || identityMutation.isPending}
            className="w-full bg-tb-green hover:bg-tb-green/90 text-white h-12 rounded-xl text-base gap-2"
          >
            {identityMutation.isPending ? "Envoi..." : "Continuer vers le paiement"} <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
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

  const orderMutation = trpc.orders.create.useMutation();
  const paymentMutation = trpc.payments.initiate.useMutation();

  const product = productQuery.data;
  const advanceAmount = product ? Math.round(product.groupPrice * 0.1) : 0;

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
          <div className="tb-card mb-6">
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
            </div>
          </div>
        )}

        <h3 className="font-semibold mb-3">Choisissez votre méthode de paiement</h3>
        <div className="space-y-3 mb-6">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.key}
              onClick={() => setPaymentMethod(method.key)}
              className={`w-full tb-card flex items-start gap-3 text-left transition-all ${
                paymentMethod === method.key ? "ring-2 ring-tb-green border-tb-green" : ""
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

        <Button
          onClick={handlePay}
          disabled={orderMutation.isPending || paymentMutation.isPending}
          className="w-full bg-tb-green hover:bg-tb-green/90 text-white h-12 rounded-xl text-base gap-2"
        >
          {orderMutation.isPending || paymentMutation.isPending ? "Traitement..." : `Payer ${formatFCFA(advanceAmount)} (avance 10%)`}
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
          <div className="tb-card text-left mt-6 space-y-3">
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
