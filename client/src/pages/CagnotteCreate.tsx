import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, PiggyBank, Info } from "lucide-react";
import { useState } from "react";
import { CAGNOTTE_CATEGORIES, CARRIER_TYPES } from "@shared/types";

export default function CagnotteCreate() {
  const [, navigate] = useLocation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [carrierType, setCarrierType] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState("");
  const [creatorPhone, setCreatorPhone] = useState("");
  const [creatorName, setCreatorName] = useState("");

  const createMutation = trpc.cagnottes.create.useMutation();

  const selectedCat = CAGNOTTE_CATEGORIES.find((c) => c.key === category);
  const needsReview = category === "sante" || category === "association_ong";

  const handleSubmit = async () => {
    const amount = parseInt(targetAmount.replace(/\s/g, ""), 10);
    if (!title || !category || !amount || amount < 1000) return;

    const result = await createMutation.mutateAsync({
      title,
      description,
      category,
      carrierType,
      targetAmount: amount,
      mobileMoneyNumber,
      creatorPhone,
      creatorName,
    });

    if (result?.id) {
      navigate(`/ma-cagnotte/${result.id}`);
    }
  };

  return (
    <Layout>
      <div className="container py-6 sm:py-10 max-w-lg mx-auto">
        <Link href="/ma-cagnotte" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-tb-blue/10 flex items-center justify-center">
            <PiggyBank className="w-5 h-5 text-tb-blue" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Créer une cagnotte</h1>
            <p className="text-sm text-muted-foreground">Gratuit jusqu'à 50 000 FCFA</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Category */}
          <div>
            <Label className="mb-1.5">Catégorie *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Choisir une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {CAGNOTTE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.key} value={cat.key}>
                    {cat.icon} {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCat && "notice" in selectedCat && selectedCat.notice && (
              <div className="flex items-start gap-2 mt-2 p-2.5 rounded-lg bg-tb-orange/5 text-sm text-tb-orange">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{selectedCat.notice}</span>
              </div>
            )}
          </div>

          {/* Carrier Type */}
          <div>
            <Label className="mb-1.5">Type de porteur</Label>
            <Select value={carrierType} onValueChange={setCarrierType}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Choisir un type" />
              </SelectTrigger>
              <SelectContent>
                {CARRIER_TYPES.map((ct) => (
                  <SelectItem key={ct.key} value={ct.key}>
                    {ct.icon} {ct.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div>
            <Label className="mb-1.5">Titre de la cagnotte *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Mariage de Fatou & Ibrahim"
              className="h-12 rounded-xl"
            />
          </div>

          {/* Description */}
          <div>
            <Label className="mb-1.5">Description</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre projet pour encourager les contributions..."
              className="w-full min-h-[100px] rounded-xl border border-input bg-background px-3 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Target Amount */}
          <div>
            <Label className="mb-1.5">Objectif (FCFA) *</Label>
            <Input
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="Ex: 500000"
              className="h-12 rounded-xl"
              min={1000}
            />
          </div>

          {/* Mobile Money Number */}
          <div>
            <Label className="mb-1.5">Numéro Mobile Money (pour retrait)</Label>
            <Input
              type="tel"
              value={mobileMoneyNumber}
              onChange={(e) => setMobileMoneyNumber(e.target.value)}
              placeholder="70 00 00 00"
              className="h-12 rounded-xl"
            />
          </div>

          {/* Creator Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5">Votre nom</Label>
              <Input
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder="Nom"
                className="h-12 rounded-xl"
              />
            </div>
            <div>
              <Label className="mb-1.5">Votre téléphone</Label>
              <Input
                type="tel"
                value={creatorPhone}
                onChange={(e) => setCreatorPhone(e.target.value)}
                placeholder="70 00 00 00"
                className="h-12 rounded-xl"
              />
            </div>
          </div>

          {needsReview && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
              <p className="font-semibold mb-1">Validation requise</p>
              <p>Les cagnottes de type {selectedCat?.label} nécessitent une validation par l'équipe Terra Biga avant publication.</p>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!title || !category || !targetAmount || createMutation.isPending}
            className="w-full bg-tb-blue hover:bg-tb-blue/90 text-white h-12 rounded-xl text-base gap-2"
          >
            {createMutation.isPending ? "Création..." : needsReview ? "Soumettre pour validation" : "Créer ma cagnotte"}
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </Layout>
  );
}
