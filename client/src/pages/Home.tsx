import Layout from "@/components/Layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ShoppingCart, PiggyBank, Users, TrendingDown, CreditCard, MapPin,
  Smartphone, Shield, Share2, ChevronRight, Star, Zap, Gift,
  ArrowRight, CheckCircle
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
              La première plateforme communautaire d'achat groupé et de cagnotte collective au Burkina Faso
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
                  Créer une Cagnotte
                </Button>
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative circles */}
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
              <AnimatedCounter end={8500000} prefix="" suffix="" />
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

      {/* ─── Te Raga Section ──────────────────────────────────── */}
      <section className="tb-section">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="tb-heading">Acheter ensemble <span className="text-tb-green">facilement</span></h2>
            <p className="tb-subheading max-w-lg mx-auto">
              Rejoignez un groupe d'achat et bénéficiez de prix réduits sur des produits du quotidien.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto mb-8">
            <div className="tb-card text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-tb-green/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-tb-green" />
              </div>
              <h3 className="font-semibold mb-1">Prix réduits</h3>
              <p className="text-sm text-muted-foreground">Jusqu'à -30% grâce à l'achat groupé</p>
            </div>
            <div className="tb-card text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-tb-orange/10 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-tb-orange" />
              </div>
              <h3 className="font-semibold mb-1">Paiement en 2 fois</h3>
              <p className="text-sm text-muted-foreground">10% d'avance, 90% à la collecte</p>
            </div>
            <div className="tb-card text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-tb-blue/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-tb-blue" />
              </div>
              <h3 className="font-semibold mb-1">Collecte à Ouaga</h3>
              <p className="text-sm text-muted-foreground">Dépôt Terra Biga — ZAD, Ouagadougou</p>
            </div>
          </div>
          <div className="text-center">
            <Link href="/te-raga">
              <Button variant="outline" className="gap-2 rounded-xl border-tb-green text-tb-green hover:bg-tb-green/5">
                Voir les offres groupées <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Ma Cagnotte Section ──────────────────────────────── */}
      <section className="tb-section bg-white">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="tb-heading">Cotiser ensemble <span className="text-tb-blue">facilement</span></h2>
            <p className="tb-subheading max-w-lg mx-auto">
              Créez une cagnotte en quelques secondes et recevez les contributions via Mobile Money.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto mb-8">
            <div className="tb-card text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-tb-green/10 flex items-center justify-center">
                <Gift className="w-6 h-6 text-tb-green" />
              </div>
              <h3 className="font-semibold mb-1">Création gratuite</h3>
              <p className="text-sm text-muted-foreground">Gratuit jusqu'à 50 000 FCFA</p>
            </div>
            <div className="tb-card text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-tb-orange/10 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-tb-orange" />
              </div>
              <h3 className="font-semibold mb-1">Paiement Mobile Money</h3>
              <p className="text-sm text-muted-foreground">Orange Money & Moov Money</p>
            </div>
            <div className="tb-card text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-tb-blue/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-tb-blue" />
              </div>
              <h3 className="font-semibold mb-1">Retrait sécurisé</h3>
              <p className="text-sm text-muted-foreground">Retirez directement via Mobile Money</p>
            </div>
          </div>

          {/* Sample cagnotte cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
            {[
              { title: "Mariage de Fatou & Ibrahim", category: "Mariage", current: 175000, target: 500000, contributors: 12 },
              { title: "Scolarité pour Aminata", category: "Éducation", current: 89000, target: 250000, contributors: 8 },
              { title: "Puits communautaire", category: "Construction", current: 420000, target: 1500000, contributors: 35 },
            ].map((c, i) => (
              <div key={i} className="tb-card">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-tb-blue/10 text-tb-blue font-medium">{c.category}</span>
                </div>
                <h3 className="font-semibold text-foreground mb-3 line-clamp-1">{c.title}</h3>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-tb-green">{new Intl.NumberFormat("fr-FR").format(c.current)} FCFA</span>
                    <span className="text-muted-foreground">{Math.round((c.current / c.target) * 100)}%</span>
                  </div>
                  <Progress value={(c.current / c.target) * 100} className="h-2.5" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Objectif : {new Intl.NumberFormat("fr-FR").format(c.target)} FCFA &middot; {c.contributors} contributeurs
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/ma-cagnotte/creer">
              <Button variant="outline" className="gap-2 rounded-xl border-tb-blue text-tb-blue hover:bg-tb-blue/5">
                Créer ma cagnotte <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─────────────────────────────────────── */}
      <section className="tb-section">
        <div className="container">
          <h2 className="tb-heading text-center mb-8">Comment ça marche ?</h2>
          <Tabs defaultValue="teraga" className="max-w-2xl mx-auto">
            <TabsList className="w-full grid grid-cols-2 h-11 mb-6">
              <TabsTrigger value="teraga" className="text-sm font-semibold">Te Raga</TabsTrigger>
              <TabsTrigger value="cagnotte" className="text-sm font-semibold">Ma Cagnotte</TabsTrigger>
            </TabsList>
            <TabsContent value="teraga" className="space-y-5">
              <StepCard step={1} title="Choisissez votre pack" description="Parcourez notre catalogue de produits groupés à prix réduits." icon={<ShoppingCart className="w-4 h-4 text-tb-green" />} />
              <StepCard step={2} title="Rejoignez un groupe" description="Intégrez un groupe d'achat existant ou attendez qu'il se remplisse." icon={<Users className="w-4 h-4 text-tb-green" />} />
              <StepCard step={3} title="Payez 10% d'avance" description="Réservez votre place avec un acompte de 10% via Mobile Money." icon={<CreditCard className="w-4 h-4 text-tb-green" />} />
              <StepCard step={4} title="Collectez au dépôt ZAD" description="Récupérez votre commande et payez le solde de 90% sur place." icon={<MapPin className="w-4 h-4 text-tb-green" />} />
            </TabsContent>
            <TabsContent value="cagnotte" className="space-y-5">
              <StepCard step={1} title="Créez votre cagnotte" description="Choisissez une catégorie, définissez un objectif et c'est parti !" icon={<PiggyBank className="w-4 h-4 text-tb-blue" />} />
              <StepCard step={2} title="Partagez le lien" description="Envoyez le lien par WhatsApp, SMS ou tout autre moyen." icon={<Share2 className="w-4 h-4 text-tb-blue" />} />
              <StepCard step={3} title="Recevez les contributions" description="Vos proches contribuent facilement via Mobile Money." icon={<CreditCard className="w-4 h-4 text-tb-blue" />} />
              <StepCard step={4} title="Retirez via Mobile Money" description="Transférez les fonds collectés directement sur votre compte." icon={<Smartphone className="w-4 h-4 text-tb-blue" />} />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* ─── Testimonials ─────────────────────────────────────── */}
      <section className="tb-section bg-white">
        <div className="container">
          <h2 className="tb-heading text-center mb-8">Ils nous font confiance</h2>
          <div className="max-w-lg mx-auto">
            <div className="tb-card text-center">
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
      <section className="tb-section">
        <div className="container">
          <h2 className="tb-heading text-center mb-2">Payez facilement avec Mobile Money</h2>
          <p className="tb-subheading text-center mb-8">Deux options de paiement adaptées à tous</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
            <div className="tb-card">
              <div className="flex items-center gap-2 mb-3">
                <Smartphone className="w-5 h-5 text-tb-orange" />
                <h3 className="font-semibold">USSD</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-tb-orange/10 text-tb-orange font-semibold">Recommandé</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Fonctionne sans internet, sur tout téléphone</p>
              <div className="flex gap-2">
                <span className="text-xs px-2 py-1 rounded-lg bg-orange-50 text-orange-600 font-medium">Orange Money</span>
                <span className="text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-600 font-medium">Moov Money</span>
              </div>
            </div>
            <div className="tb-card">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-tb-blue" />
                <h3 className="font-semibold">Ligidicash</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Paiement sécurisé par OTP</p>
              <div className="flex gap-2">
                <span className="text-xs px-2 py-1 rounded-lg bg-green-50 text-green-600 font-medium">Code OTP par SMS</span>
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
                Commencer un achat groupé
              </Button>
            </Link>
            <Link href="/ma-cagnotte/creer">
              <Button className="w-full sm:w-auto bg-white/20 text-white hover:bg-white/30 border border-white/30 h-12 px-6 text-base rounded-xl gap-2 font-semibold">
                <PiggyBank className="w-5 h-5" />
                Créer une cagnotte
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
