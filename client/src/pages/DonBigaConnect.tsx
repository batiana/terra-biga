import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Heart, ArrowRight, CheckCircle, Globe, Users, Shield,
  Phone, Smartphone
} from "lucide-react";
import { useState } from "react";
import { PAYMENT_METHODS, SUGGESTED_DONATION_AMOUNTS } from "@shared/types";

function formatFCFA(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

export default function DonBigaConnect() {
  const [showForm, setShowForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [amount, setAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("ussd_orange");

  const donationMutation = trpc.donations.create.useMutation();
  const paymentMutation = trpc.payments.initiate.useMutation();
  const donationsQuery = trpc.donations.list.useQuery();

  const totalDonated = donationsQuery.data?.reduce((sum, d) => sum + d.amount, 0) ?? 0;
  const donorCount = donationsQuery.data?.length ?? 0;

  const handleDonate = async () => {
    const amountNum = parseInt(amount.replace(/\s/g, ""), 10);
    if (!amountNum || amountNum < 100 || !donorPhone) return;

    await donationMutation.mutateAsync({
      donorName,
      donorPhone,
      amount: amountNum,
      paymentMethod,
    });

    await paymentMutation.mutateAsync({
      type: "donation",
      referenceId: undefined,
      amount: amountNum,
      method: paymentMethod as "ussd_orange" | "ussd_moov" | "ligidicash",
      phone: donorPhone,
    });

    setShowConfirmation(true);
    setShowForm(false);
  };

  if (showConfirmation) {
    return (
      <Layout>
        <div className="container py-10 sm:py-16 max-w-lg mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-tb-green/10 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-tb-green" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Merci pour votre don !</h1>
          <p className="text-muted-foreground mb-2">Votre don de {formatFCFA(parseInt(amount))} a été enregistré.</p>
          <p className="text-sm text-muted-foreground mb-6">100% de votre don sera reversé aux projets communautaires.</p>
          <Button onClick={() => { setShowConfirmation(false); setAmount(""); }} variant="outline" className="rounded-xl gap-2">
            Faire un autre don
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-tb-orange/10 via-background to-tb-green/10 py-12 sm:py-16">
        <div className="container text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-tb-orange to-tb-green flex items-center justify-center">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Don BIGA <span className="text-tb-orange">CONNECT</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Soutenez les projets communautaires au Burkina Faso. 100% de votre don est reversé.
          </p>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-tb-orange hover:bg-tb-orange/90 text-white h-12 px-8 text-base rounded-xl gap-2"
          >
            <Heart className="w-5 h-5" /> Faire un don
          </Button>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-y border-border py-8">
        <div className="container">
          <div className="grid grid-cols-3 gap-4 text-center max-w-xl mx-auto">
            <div>
              <p className="text-2xl font-bold text-tb-green">{formatFCFA(totalDonated)}</p>
              <p className="text-xs text-muted-foreground mt-1">Total collecté</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-tb-orange">{donorCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Donateurs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-tb-blue">100%</p>
              <p className="text-xs text-muted-foreground mt-1">Reversé</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="tb-section">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="tb-card text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-tb-green/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-tb-green" />
              </div>
              <h3 className="font-semibold mb-1">Transparence totale</h3>
              <p className="text-sm text-muted-foreground">Chaque franc est tracé et reversé intégralement</p>
            </div>
            <div className="tb-card text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-tb-orange/10 flex items-center justify-center">
                <Globe className="w-6 h-6 text-tb-orange" />
              </div>
              <h3 className="font-semibold mb-1">Impact local</h3>
              <p className="text-sm text-muted-foreground">Projets communautaires au Burkina Faso</p>
            </div>
            <div className="tb-card text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-tb-blue/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-tb-blue" />
              </div>
              <h3 className="font-semibold mb-1">Communauté</h3>
              <p className="text-sm text-muted-foreground">Ensemble on va plus loin</p>
            </div>
          </div>
        </div>
      </section>

      {/* Donation Form */}
      {showForm && (
        <section className="tb-section bg-white">
          <div className="container max-w-lg mx-auto">
            <div className="tb-card space-y-4">
              <h3 className="font-semibold text-xl text-center mb-2">Faire un don</h3>

              <div>
                <Label className="mb-2">Montant (FCFA) *</Label>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {SUGGESTED_DONATION_AMOUNTS.map((a) => (
                    <button
                      key={a}
                      onClick={() => setAmount(String(a))}
                      className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                        amount === String(a) ? "bg-tb-orange text-white border-tb-orange" : "bg-white text-foreground border-border hover:border-tb-orange/50"
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

              <div>
                <Label className="mb-1.5">Votre nom (optionnel)</Label>
                <Input
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Votre nom"
                  className="h-12 rounded-xl"
                />
              </div>

              <div>
                <Label className="mb-1.5 flex items-center gap-2"><Phone className="w-4 h-4" /> Numéro de téléphone *</Label>
                <Input
                  type="tel"
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  placeholder="70 00 00 00"
                  className="h-12 rounded-xl"
                />
              </div>

              <div>
                <Label className="mb-2">Méthode de paiement</Label>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.key}
                      onClick={() => setPaymentMethod(method.key)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        paymentMethod === method.key ? "ring-2 ring-tb-orange border-tb-orange" : "border-border"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        paymentMethod === method.key ? "border-tb-orange" : "border-border"
                      }`}>
                        {paymentMethod === method.key && <div className="w-2 h-2 rounded-full bg-tb-orange" />}
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
                onClick={handleDonate}
                disabled={!amount || parseInt(amount) < 100 || !donorPhone || donationMutation.isPending}
                className="w-full bg-tb-orange hover:bg-tb-orange/90 text-white h-12 rounded-xl text-base gap-2"
              >
                {donationMutation.isPending ? "Traitement..." : `Donner ${amount ? formatFCFA(parseInt(amount)) : ""}`}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
