import Layout from "@/components/Layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ShoppingCart, PiggyBank, Users, TrendingDown, CreditCard, MapPin,
  Smartphone, Shield, Share2, ChevronRight, Star, Zap, Gift,
  ArrowRight, CheckCircle, Mail, Phone, Heart, Globe, Award
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

// ─── Animated Counter ────────────────────────────────────────────────
function AnimatedCounter({ end, suffix = "", prefix = "" }: { end: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1500;
          const steps = 40;
          const increment = end / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return (
    <div ref={ref} className="text-2xl sm:text-3xl font-bold text-tb-green">
      {prefix}{new Intl.NumberFormat("fr-FR").format(count)}{suffix}
    </div>
  );
}

// ─── Step Card ───────────────────────────────────────────────────────
function StepCard({ step, title, description, icon }: { step: number; title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="shrink-0 w-10 h-10 rounded-full bg-tb-green/10 text-tb-green flex items-center justify-center font-bold text-sm">
        {step}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <h4 className="font-semibold text-foreground">{title}</h4>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

// ─── Testimonial ─────────────────────────────────────────────────────
const testimonials = [
  { name: "Fatou D.", city: "Ouagadougou", text: "Grâce à Te Raga, j'ai économisé 30% sur mon kit solaire. Le groupe s'est rempli en 3 jours !", avatar: "FD" },
  { name: "Ibrahim K.", city: "Bobo-Dioulasso", text: "Ma Cagnotte nous a permis de financer le mariage de ma sœur. Simple et rapide !", avatar: "IK" },
  { name: "Aminata S.", city: "Koudougou", text: "Le paiement USSD fonctionne même sans internet. C'est parfait pour nous ici.", avatar: "AS" },
];

export default function Home() {
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIdx((i) => (i + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Layout>
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-tb-green/5 via-background to-tb-orange/5">
        <div className="container py-12 sm:py-20 lg:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
              Ensemble on va <span className="text-tb-green">plus loin</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              La première plateforme communautaire d'achat groupé et de cagnotte collective en Afrique de l'Ouest
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/te-raga">
                <Button className="w-full sm:w-auto bg-tb-green hover:bg-tb-green/90 text-white h-12 px-6 text-base rounded-xl gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Découvrir Te Raga
                </Button>
              </Link>
              <Link href="/ma-cagnotte/creer">
                <Button className="w-full sm:w-auto bg-tb-blue hover:bg-tb-blue/90 text-white h-12 px-6 text-base rounded-xl gap-2">
                  <PiggyBank className="w-5 h-5" />
                  Lancer une Cagnotte
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-tb-green/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-tb-orange/5 rounded-full blur-3xl" />
      </section>

      {/* ─── Key Figures ──────────────────────────────────────── */}
      <section className="bg-white border-y border-border">
        <div className="container py-10 sm:py-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div>
              <AnimatedCounter end={1250} suffix="+" />
              <p className="text-sm text-muted-foreground mt-1">Membres actifs</p>
            </div>
            <div>
              <AnimatedCounter end={8500000} />
              <p className="text-sm text-muted-foreground mt-1">FCFA économisés</p>
            </div>
            <div>
              <AnimatedCounter end={47} />
              <p className="text-sm text-muted-foreground mt-1">Cagnottes financées</p>
            </div>
            <div>
              <AnimatedCounter end={23} />
              <p className="text-sm text-muted-foreground mt-1">Groupes complétés</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Two Pillars: Achat Communautaire vs Financement Communautaire ─── */}
      <section className="py-10 sm:py-16">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Nos deux piliers</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Deux façons de s'entraider : acheter ensemble pour économiser, ou cotiser ensemble pour réaliser un projet.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* ── Pilier 1 : Achat Communautaire ── */}
            <div className="rounded-2xl border-2 border-tb-green/20 bg-gradient-to-b from-tb-green/5 to-white p-6 sm:p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-tb-green/10 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-tb-green" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Achat Communautaire</h3>
                  <p className="text-sm text-tb-green font-medium">Te Raga</p>
                </div>
              </div>

              <p className="text-muted-foreground text-sm mb-5">
                Rejoignez un groupe d'achat et bénéficiez de prix réduits grâce à la force du collectif. Plus on est nombreux, moins on paie.
              </p>

              {/* Savings highlight */}
              <div className="bg-tb-green/10 rounded-xl p-4 mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-tb-green" />
                  <span className="font-bold text-tb-green">Économie garantie</span>
                </div>
                <p className="text-sm text-foreground">
                  Jusqu'à <span className="font-bold text-tb-green">-30%</span> sur le prix standard grâce à l'achat groupé. Paiement en 2 fois : <span className="font-semibold">10% d'avance</span>, 90% à la collecte.
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-tb-green shrink-0" />
                  <span>Prix réduits grâce au volume</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-tb-green shrink-0" />
                  <span>Paiement en 2 fois (10% + 90%)</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-tb-green shrink-0" />
                  <span>Collecte au dépôt ZAD, Ouagadougou</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-tb-green shrink-0" />
                  <span>Orange Money, Moov Money, Ligidicash</span>
                </div>
              </div>

              <div className="mt-auto">
                <Link href="/te-raga">
                  <Button className="w-full bg-tb-green hover:bg-tb-green/90 text-white h-12 rounded-xl text-base gap-2">
                    Rejoindre un groupe d'achat <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* ── Pilier 2 : Financement Communautaire ── */}
            <div className="rounded-2xl border-2 border-tb-blue/20 bg-gradient-to-b from-tb-blue/5 to-white p-6 sm:p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-tb-blue/10 flex items-center justify-center">
                  <PiggyBank className="w-6 h-6 text-tb-blue" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Financement Communautaire</h3>
                  <p className="text-sm text-tb-blue font-medium">Ma Cagnotte</p>
                </div>
              </div>

              <p className="text-muted-foreground text-sm mb-5">
                Créez une cagnotte pour financer un projet (mariage, santé, éducation, événement) et recevez les contributions de vos proches via Mobile Money.
              </p>

              {/* Contribution highlight */}
              <div className="bg-tb-blue/10 rounded-xl p-4 mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-tb-blue" />
                  <span className="font-bold text-tb-blue">Solidarité simplifiée</span>
                </div>
                <p className="text-sm text-foreground">
                  Gratuit jusqu'à <span className="font-bold text-tb-blue">50 000 FCFA</span>. Partagez le lien par WhatsApp et recevez les contributions instantanément.
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-tb-blue shrink-0" />
                  <span>Création gratuite et instantanée</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-tb-blue shrink-0" />
                  <span>Contributions anonymes ou identifiées</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-tb-blue shrink-0" />
                  <span>Retrait direct via Mobile Money</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-tb-blue shrink-0" />
                  <span>Possibilité de faire un don BIGA CONNECT</span>
                </div>
              </div>

              <div className="mt-auto">
                <Link href="/ma-cagnotte/creer">
                  <Button className="w-full bg-tb-blue hover:bg-tb-blue/90 text-white h-12 rounded-xl text-base gap-2">
                    Lancer une cagnotte <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─────────────────────────────────────── */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="container">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-8">Comment ça marche ?</h2>
          <Tabs defaultValue="teraga" className="max-w-2xl mx-auto">
            <TabsList className="w-full grid grid-cols-2 h-11 mb-6">
              <TabsTrigger value="teraga" className="text-sm font-semibold">Te Raga</TabsTrigger>
              <TabsTrigger value="cagnotte" className="text-sm font-semibold">Ma Cagnotte</TabsTrigger>
            </TabsList>
            <TabsContent value="teraga" className="space-y-5">
              <StepCard step={1} title="Choisissez votre pack" description="Parcourez notre catalogue de produits groupés à prix réduits." icon={<ShoppingCart className="w-4 h-4 text-tb-green" />} />
              <StepCard step={2} title="Rejoignez un groupe" description="Intégrez un groupe, renseignez votre identité et confirmez votre place." icon={<Users className="w-4 h-4 text-tb-green" />} />
              <StepCard step={3} title="Payez 10% d'avance" description="Réservez votre place avec un acompte de 10% via Mobile Money." icon={<CreditCard className="w-4 h-4 text-tb-green" />} />
              <StepCard step={4} title="Collectez au dépôt ZAD" description="Récupérez votre commande et payez le solde de 90% sur place." icon={<MapPin className="w-4 h-4 text-tb-green" />} />
            </TabsContent>
            <TabsContent value="cagnotte" className="space-y-5">
              <StepCard step={1} title="Créez votre cagnotte" description="Choisissez une catégorie, ajoutez une photo et définissez un objectif." icon={<PiggyBank className="w-4 h-4 text-tb-blue" />} />
              <StepCard step={2} title="Partagez le lien" description="Envoyez le lien par WhatsApp, SMS ou tout autre moyen." icon={<Share2 className="w-4 h-4 text-tb-blue" />} />
              <StepCard step={3} title="Recevez les contributions" description="Vos proches contribuent facilement via Mobile Money. Possibilité de don BIGA CONNECT." icon={<CreditCard className="w-4 h-4 text-tb-blue" />} />
              <StepCard step={4} title="Retirez via Mobile Money" description="Transférez les fonds collectés directement sur votre numéro Mobile Money." icon={<Smartphone className="w-4 h-4 text-tb-blue" />} />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* ─── Testimonials ─────────────────────────────────────── */}
      <section className="py-10 sm:py-16">
        <div className="container">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-8">Ils nous font confiance</h2>
          <div className="max-w-lg mx-auto">
            <div className="rounded-2xl border border-border bg-white p-6 text-center shadow-sm">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-tb-green/10 flex items-center justify-center">
                <span className="text-tb-green font-bold text-lg">{testimonials[testimonialIdx].avatar}</span>
              </div>
              <p className="text-foreground mb-4 italic">"{testimonials[testimonialIdx].text}"</p>
              <p className="font-semibold text-foreground">{testimonials[testimonialIdx].name}</p>
              <p className="text-sm text-muted-foreground">{testimonials[testimonialIdx].city}</p>
            </div>
            <div className="flex justify-center gap-2 mt-4">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIdx(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${i === testimonialIdx ? "bg-tb-green" : "bg-border"}`}
                  aria-label={`Témoignage ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Payment Methods ──────────────────────────────────── */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="container">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-2">Payez facilement avec Mobile Money</h2>
          <p className="text-muted-foreground text-center mb-8">Trois options de paiement adaptées à tous</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
            <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Smartphone className="w-5 h-5 text-tb-orange" />
                <h3 className="font-semibold">Orange Money</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2">USSD — fonctionne sans internet</p>
              <span className="text-xs px-2 py-1 rounded-lg bg-orange-50 text-orange-600 font-medium">Recommandé</span>
            </div>
            <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Smartphone className="w-5 h-5 text-tb-blue" />
                <h3 className="font-semibold">Moov Money</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2">USSD — fonctionne sans internet</p>
              <span className="text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-600 font-medium">Disponible</span>
            </div>
            <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-tb-green" />
                <h3 className="font-semibold">Ligidicash</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Paiement sécurisé par OTP</p>
              <span className="text-xs px-2 py-1 rounded-lg bg-green-50 text-green-600 font-medium">Sécurisé</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── À propos ─────────────────────────────────────────── */}
      <section id="a-propos" className="py-10 sm:py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">À propos de Terra Biga</h2>
              <p className="text-muted-foreground">Notre mission : rendre l'économie collaborative accessible à tous</p>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-sm mb-6">
              <p className="text-foreground leading-relaxed mb-4">
                <span className="font-bold text-tb-green">Terra Biga</span> est la première plateforme communautaire d'achat groupé et de cagnotte collective en Afrique de l'Ouest. Née au Burkina Faso, notre mission est de permettre à chacun d'économiser grâce à la force du collectif et de financer ses projets de vie grâce à la solidarité communautaire.
              </p>
              <p className="text-foreground leading-relaxed mb-4">
                "Te Raga" signifie "viens acheter" en Mooré. C'est l'esprit de notre plateforme : ensemble, on achète mieux et on va plus loin. Que ce soit pour un kit solaire, des fournitures scolaires ou un mariage, Terra Biga est là pour vous accompagner.
              </p>
              <p className="text-foreground leading-relaxed">
                Optimisée pour les smartphones d'entrée de gamme et les connexions 3G, notre plateforme est conçue pour être accessible à tous, partout en Afrique de l'Ouest.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border bg-white p-4 text-center shadow-sm">
                <Award className="w-8 h-8 text-tb-orange mx-auto mb-2" />
                <p className="font-semibold text-sm">Lauréate Faso Digital</p>
                <p className="text-xs text-muted-foreground">& POESAM</p>
              </div>
              <div className="rounded-xl border border-border bg-white p-4 text-center shadow-sm">
                <Globe className="w-8 h-8 text-tb-green mx-auto mb-2" />
                <p className="font-semibold text-sm">Membre Orange Fab</p>
                <p className="text-xs text-muted-foreground">Burkina Faso</p>
              </div>
              <div className="rounded-xl border border-border bg-white p-4 text-center shadow-sm">
                <Star className="w-8 h-8 text-tb-blue mx-auto mb-2" />
                <p className="font-semibold text-sm">Partenaire Lefaso.net</p>
                <p className="text-xs text-muted-foreground">Média partenaire</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Contact ──────────────────────────────────────────── */}
      <section id="contact" className="py-10 sm:py-16 bg-white">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Contactez-nous</h2>
              <p className="text-muted-foreground">Une question ? Un partenariat ? Nous sommes à votre écoute.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="rounded-2xl border border-border bg-background p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-tb-green/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-tb-green" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Téléphone</h4>
                  <p className="text-sm text-muted-foreground">+226 70 00 00 00</p>
                  <p className="text-sm text-muted-foreground">+226 76 00 00 00</p>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-background p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-tb-blue/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-tb-blue" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Email</h4>
                  <p className="text-sm text-muted-foreground">contact@terrabiga.com</p>
                  <p className="text-sm text-muted-foreground">support@terrabiga.com</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-tb-orange/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-tb-orange" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Adresse</h4>
                <p className="text-sm text-muted-foreground">Zone d'Activités Diverses (ZAD)</p>
                <p className="text-sm text-muted-foreground">Ouagadougou, Burkina Faso</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-tb-green to-tb-green/90 py-12 sm:py-16">
        <div className="container text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Rejoignez la communauté Terra Biga</h2>
          <p className="text-white/80 mb-6 max-w-md mx-auto">Ensemble, économisons et entraidons-nous</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/te-raga">
              <Button className="w-full sm:w-auto bg-white text-tb-green hover:bg-white/90 h-12 px-6 text-base rounded-xl gap-2 font-semibold">
                <ShoppingCart className="w-5 h-5" />
                Rejoindre un groupe d'achat
              </Button>
            </Link>
            <Link href="/ma-cagnotte/creer">
              <Button className="w-full sm:w-auto bg-white/20 text-white hover:bg-white/30 border border-white/30 h-12 px-6 text-base rounded-xl gap-2 font-semibold">
                <PiggyBank className="w-5 h-5" />
                Lancer une cagnotte
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
