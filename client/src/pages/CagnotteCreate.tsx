import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, PiggyBank, Info, Camera, FileText, X } from "lucide-react";
import { useState, useRef } from "react";
import { CAGNOTTE_CATEGORIES, CARRIER_TYPES } from "@shared/types";

export default function CagnotteCreate() {
  const [, navigate] = useLocation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [carrierType, setCarrierType] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState("");
  const [creatorName, setCreatorName] = useState("");

  // Photo upload
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Medical docs (for santé category)
  const [medicalDocPreview, setMedicalDocPreview] = useState<string | null>(null);
  const [medicalDocFile, setMedicalDocFile] = useState<File | null>(null);
  const medicalInputRef = useRef<HTMLInputElement>(null);

  const createMutation = trpc.cagnottes.create.useMutation();

  const selectedCat = CAGNOTTE_CATEGORIES.find((c) => c.key === category);
  const needsReview = category === "sante" || category === "association_ong";
  const isSante = category === "sante";

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleMedicalDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMedicalDocFile(file);
      setMedicalDocPreview(file.name);
    }
  };

  const handleSubmit = async () => {
    const amount = parseInt(targetAmount.replace(/\s/g, ""), 10);
    if (!title || !category) return;

    const result = await createMutation.mutateAsync({
      title,
      description,
      category,
      carrierType,
      targetAmount: amount && amount >= 1000 ? amount : undefined,
      mobileMoneyNumber,
      creatorName,
    });

    // FIX: le router retourne soit requiresPayment (frais 500 FCFA) soit cagnotte+slug
    if (result.requiresPayment) {
      // Rediriger vers Ligdicash pour payer les frais
      window.location.href = result.redirectUrl;
      return;
    }
    // Création directe — naviguer vers la cagnotte
    const id = result.cagnotte?.id;
    const slug = result.slug;
    if (slug) {
      navigate(`/c/${slug}`);
    } else if (id) {
      navigate(`/ma-cagnotte/${id}`);
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

        <div className="space-y-5">
          {/* Category */}
          <div>
            <Label className="mb-1.5 text-sm">Catégorie *</Label>
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

          {/* Medical documents (santé only) — right after category */}
          {isSante && (
            <div>
              <Label className="mb-1.5 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-tb-orange" />
                Documents médicaux (optionnel)
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Ordonnance, certificat médical ou devis hospitalier pour renforcer la crédibilité de votre cagnotte.
              </p>
              <div
                onClick={() => medicalInputRef.current?.click()}
                className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-4 flex items-center gap-3 cursor-pointer hover:border-tb-orange/50 transition-colors"
              >
                {medicalDocPreview ? (
                  <div className="flex items-center gap-2 w-full">
                    <FileText className="w-5 h-5 text-tb-orange shrink-0" />
                    <span className="text-sm text-foreground truncate flex-1">{medicalDocPreview}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMedicalDocPreview(null);
                        setMedicalDocFile(null);
                      }}
                      className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <FileText className="w-5 h-5 text-muted-foreground/50" />
                    <div>
                      <p className="text-sm text-muted-foreground">Ajouter un document</p>
                      <p className="text-xs text-muted-foreground/60">PDF, JPG, PNG — max 10 Mo</p>
                    </div>
                  </>
                )}
              </div>
              <input
                ref={medicalInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleMedicalDocChange}
                className="hidden"
              />
            </div>
          )}

          {/* Carrier Type */}
          <div>
            <Label className="mb-1.5 text-sm">Type de porteur</Label>
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
            <Label className="mb-1.5 text-sm">Titre de la cagnotte *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Mariage de Fatou & Ibrahim"
              className="h-12 rounded-xl"
            />
          </div>

          {/* Description */}
          <div>
            <Label className="mb-1.5 text-sm">Description</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre projet pour encourager les contributions..."
              className="w-full min-h-[100px] rounded-xl border border-input bg-background px-3 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Target Amount */}
          <div>
            <Label className="mb-1.5 text-sm">Objectif (FCFA) *</Label>
            <Input
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="Ex: 500000"
              className="h-12 rounded-xl"
              min={1000}
            />
          </div>

          {/* Mobile Money Number (for withdrawal) */}
          <div>
            <Label className="mb-1.5 text-sm">Numéro Mobile Money (pour retrait) *</Label>
            <Input
              type="tel"
              value={mobileMoneyNumber}
              onChange={(e) => setMobileMoneyNumber(e.target.value)}
              placeholder="70 00 00 00"
              className="h-12 rounded-xl"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Les fonds collectés seront transférés sur ce numéro Mobile Money.
            </p>
          </div>

          {/* Creator Name */}
          <div>
            <Label className="mb-1.5 text-sm">Votre nom</Label>
            <Input
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              placeholder="Nom du créateur"
              className="h-12 rounded-xl"
            />
          </div>

          {/* Photo upload — moved to end of form */}
          <div>
            <Label className="mb-1.5 text-sm">Photo de la cagnotte (optionnel)</Label>
            <div
              onClick={() => photoInputRef.current?.click()}
              className="relative h-40 rounded-xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center cursor-pointer hover:border-tb-blue/50 transition-colors overflow-hidden"
            >
              {photoPreview ? (
                <>
                  <img src={photoPreview} alt="Aperçu" className="w-full h-full object-cover" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoPreview(null);
                      setPhotoFile(null);
                    }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <Camera className="w-8 h-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">Ajouter une photo</p>
                  <p className="text-xs text-muted-foreground/60">JPG, PNG — max 5 Mo</p>
                </>
              )}
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
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
