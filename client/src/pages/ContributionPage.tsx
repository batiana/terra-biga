import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Link, useRoute } from "wouter";

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

export default function ContributionPage() {
  const [, params] = useRoute("/c/:slug/contribuer");
  const slug = params?.slug ?? "";

  const cagnotteQuery = trpc.cagnottes.bySlug.useQuery({ slug }, { enabled: Boolean(slug) });
  const contributionMutation = trpc.contributions.create.useMutation();
  const donationMutation = trpc.donations.create.useMutation();
  const paymentMutation = trpc.payments.initiate.useMutation();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [cguAccepted, setCguAccepted] = useState(false);
  const method: "ussd_orange" = "ussd_orange";

  const cagnotte = cagnotteQuery.data;
  const isOng = cagnotte?.type === "ong";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cagnotte) return;

    const amountValue = Number(amount);
    if (!phone || Number.isNaN(amountValue) || amountValue < 100 || !cguAccepted) return;

    if (isOng) {
      const donation = await donationMutation.mutateAsync({
        donorName: isAnonymous ? undefined : name || undefined,
        donorPhone: phone,
        cagnotteId: cagnotte.id,
        amount: amountValue,
        paymentMethod: method,
      });

      await paymentMutation.mutateAsync({
        type: "donation",
        referenceId: donation?.id,
        amount: amountValue,
        method,
        phone,
        customerName: name || undefined,
        metadata: {
          cagnotteId: cagnotte.id,
          organizationId: cagnotte.organizationId,
        },
      });
    } else {
      const contribution = await contributionMutation.mutateAsync({
        cagnotteId: cagnotte.id,
        contributorName: isAnonymous ? undefined : name || undefined,
        contributorPhone: phone,
        amount: amountValue,
        message: message || undefined,
        paymentMethod: method,
        isAnonymous,
      });

      await paymentMutation.mutateAsync({
        type: "contribution",
        referenceId: contribution?.id,
        amount: amountValue,
        method,
        phone,
        customerName: name || undefined,
      });
    }

    window.location.href = `/c/${slug}`;
  }

  return (
    <Layout>
      <div className="container py-8 max-w-xl">
        <Link href={`/c/${slug}`} className="text-sm text-muted-foreground hover:text-foreground">
          ← Retour à la cagnotte
        </Link>

        <h1 className="text-2xl font-bold mt-3 mb-1">Contribuer</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {isOng ? "Contribution ONG (encaissement BIGA CONNECT)" : "Contribution directe"}
        </p>

        {cagnotte && (
          <div className="rounded-xl border p-4 mb-6 bg-white">
            <p className="font-semibold">{cagnotte.title}</p>
            <p className="text-sm text-muted-foreground">Montant collecté: {fmt(cagnotte.currentAmount)}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nom</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom" />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="anonymous"
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="anonymous">Rester anonyme</Label>
          </div>
          <div>
            <Label>Téléphone *</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="70 00 00 00" required />
          </div>
          <div>
            <Label>Montant (FCFA) *</Label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[1000, 5000, 10000, 25000].map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => setAmount(String(quickAmount))}
                  className={`rounded-lg border px-2 py-2 text-xs ${
                    amount === String(quickAmount) ? "border-orange-500 bg-orange-50" : "border-gray-200"
                  }`}
                >
                  {quickAmount.toLocaleString("fr-FR")}
                </button>
              ))}
            </div>
            <Input
              type="number"
              min={100}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1000"
              required
            />
          </div>
          {!isOng && (
            <div>
              <Label>Message</Label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
            </div>
          )}

          <div>
            <Label>Méthode de paiement</Label>
            <button
              type="button"
              className="mt-1 w-full rounded-lg border border-orange-500 bg-orange-50 px-3 py-2 text-sm font-medium text-orange-700"
            >
              🟠 Payer via Orange Money
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="cgu"
              type="checkbox"
              checked={cguAccepted}
              onChange={(e) => setCguAccepted(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="cgu">J&apos;accepte les conditions</Label>
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            disabled={
              !cguAccepted ||
              contributionMutation.isPending ||
              donationMutation.isPending ||
              paymentMutation.isPending
            }
          >
            {paymentMutation.isPending ? "Traitement..." : "Payer et valider"}
          </Button>
        </form>
      </div>
    </Layout>
  );
}
