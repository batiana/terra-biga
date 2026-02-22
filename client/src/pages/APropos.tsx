import Layout from "@/components/Layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Globe, Award, Users, Heart, Shield, Zap, Target,
  ShoppingCart, PiggyBank, ArrowRight, Star, Lightbulb, Handshake
} from "lucide-react";

const LOGO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663373135176/pkmPyuwyvofTreWf.svg";

const PARTNER_LOGOS = [
  { name: "Orange", img: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663373135176/XmecCmcJFPBQqWKs.jpg" },
  { name: "Lefaso.net", img: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663373135176/LIMdWQToaKOTXBrA.jpg" },
  { name: "Kéré Architecture", img: null },
  { name: "Ministère des Finances", img: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663373135176/JQvbdegyDYprWWUG.jpg" },
  { name: "PNUD Burkina Faso", img: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663373135176/VTjHBhKifUCRZnBS.jpg" },
  { name: "Ministère de la Transition Digitale", img: null },
];

const values = [
  {
    icon: <Users className="w-6 h-6 text-tb-green" />,
    title: "Communauté",
    description: "La force du collectif est au cœur de tout ce que nous faisons. Ensemble, nous allons plus loin."
  },
  {
    icon: <Shield className="w-6 h-6 text-tb-blue" />,
    title: "Confiance",
    description: "Transparence totale sur les prix, les transactions et l'utilisation des fonds collectés."
  },
  {
    icon: <Lightbulb className="w-6 h-6 text-tb-orange" />,
    title: "Innovation",
    description: "Des solutions technologiques adaptées au contexte africain : USSD, Mobile Money, optimisation 3G."
  },
  {
    icon: <Heart className="w-6 h-6 text-tb-green" />,
    title: "Solidarité",
    description: "Faciliter l'entraide entre les membres de la communauté, pour que personne ne soit laissé de côté."
  },
  {
    icon: <Target className="w-6 h-6 text-tb-blue" />,
    title: "Accessibilité",
    description: "Une plateforme conçue pour fonctionner sur les smartphones d'entrée de gamme et les connexions lentes."
  },
  {
    icon: <Handshake className="w-6 h-6 text-tb-orange" />,
    title: "Impact local",
    description: "Chaque transaction renforce l'économie locale et crée de la valeur pour la communauté burkinabè."
  },
];

const milestones = [
  { year: "2023", event: "Création de Terra Biga à Ouagadougou" },
  { year: "2023", event: "Lauréate du programme Faso Digital" },
  { year: "2024", event: "Lauréate POESAM — Programme d'appui à l'entrepreneuriat" },
  { year: "2024", event: "Intégration au programme Orange Fab Burkina Faso" },
  { year: "2024", event: "Partenariat avec Lefaso.net pour la visibilité médiatique" },
  { year: "2025", event: "Lancement de la plateforme Te Raga & Ma Cagnotte" },
  { year: "2025", event: "Partenariats institutionnels (PNUD, Ministères)" },
];

export default function APropos() {
  return (
    <Layout>
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-tb-green/5 via-background to-tb-blue/5 py-12 sm:py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <img src={LOGO_URL} alt="Terra Biga" className="h-14 sm:h-16 mx-auto mb-6" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
              À propos de <span className="text-tb-green">Terra Biga</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              La première plateforme communautaire d'achat groupé et de cagnotte collective en Afrique de l'Ouest.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Notre Mission ────────────────────────────────────── */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-tb-green/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-tb-green" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Notre Mission</h2>
            </div>

            <div className="space-y-4 text-foreground leading-relaxed">
              <p>
                <span className="font-bold text-tb-green">Terra Biga</span> est née d'un constat simple : en Afrique de l'Ouest, le pouvoir d'achat individuel est souvent limité, mais la force du collectif est immense. Notre mission est de transformer cette solidarité naturelle en un outil numérique accessible à tous.
              </p>
              <p>
                <span className="font-semibold">"Te Raga"</span> signifie <span className="italic">"viens acheter"</span> en Mooré, la langue la plus parlée au Burkina Faso. C'est l'esprit de notre plateforme : ensemble, on achète mieux, on économise plus, et on va plus loin.
              </p>
              <p>
                Que ce soit pour acquérir un kit solaire à prix réduit grâce à l'achat groupé, ou pour financer un mariage, des frais médicaux ou la scolarité d'un enfant grâce à une cagnotte collective, Terra Biga accompagne les communautés dans leurs projets du quotidien.
              </p>
            </div>

            {/* Key figures */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              <div className="rounded-xl bg-tb-green/5 border border-tb-green/20 p-4 text-center">
                <p className="text-2xl font-bold text-tb-green">1250+</p>
                <p className="text-xs text-muted-foreground mt-1">Membres actifs</p>
              </div>
              <div className="rounded-xl bg-tb-blue/5 border border-tb-blue/20 p-4 text-center">
                <p className="text-2xl font-bold text-tb-blue">8.5M</p>
                <p className="text-xs text-muted-foreground mt-1">FCFA économisés</p>
              </div>
              <div className="rounded-xl bg-tb-orange/5 border border-tb-orange/20 p-4 text-center">
                <p className="text-2xl font-bold text-tb-orange">47</p>
                <p className="text-xs text-muted-foreground mt-1">Cagnottes financées</p>
              </div>
              <div className="rounded-xl bg-tb-green/5 border border-tb-green/20 p-4 text-center">
                <p className="text-2xl font-bold text-tb-green">23</p>
                <p className="text-xs text-muted-foreground mt-1">Groupes complétés</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Nos Valeurs ──────────────────────────────────────── */}
      <section className="py-10 sm:py-16">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Nos Valeurs</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Six principes qui guident chacune de nos actions et décisions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-background flex items-center justify-center mb-3">
                  {v.icon}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Nos Services ─────────────────────────────────────── */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Nos Services</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="rounded-2xl border-2 border-tb-green/20 bg-gradient-to-b from-tb-green/5 to-white p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-tb-green/10 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-tb-green" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Te Raga — Achat Groupé</h3>
                  <p className="text-xs text-tb-green font-medium">"Viens acheter" en Mooré</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Rejoignez un groupe d'achat pour bénéficier de prix réduits sur des produits essentiels : kits solaires, fournitures scolaires, électronique, alimentaire. Économisez jusqu'à 30% grâce à la force du collectif.
              </p>
              <Link href="/te-raga">
                <Button variant="outline" className="gap-2 text-tb-green border-tb-green/30 hover:bg-tb-green/5">
                  Découvrir Te Raga <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="rounded-2xl border-2 border-tb-blue/20 bg-gradient-to-b from-tb-blue/5 to-white p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-tb-blue/10 flex items-center justify-center">
                  <PiggyBank className="w-5 h-5 text-tb-blue" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Ma Cagnotte — Financement Collectif</h3>
                  <p className="text-xs text-tb-blue font-medium">Cotiser ensemble facilement</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Créez une cagnotte pour financer un projet de vie : mariage, santé, éducation, événement. Partagez le lien avec vos proches et recevez les contributions directement sur votre Mobile Money.
              </p>
              <Link href="/ma-cagnotte">
                <Button variant="outline" className="gap-2 text-tb-blue border-tb-blue/30 hover:bg-tb-blue/5">
                  Découvrir Ma Cagnotte <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Parcours & Récompenses ───────────────────────────── */}
      <section className="py-10 sm:py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Notre Parcours</h2>
              <p className="text-muted-foreground">Les étapes clés de notre aventure.</p>
            </div>

            <div className="space-y-0 relative">
              {/* Timeline line */}
              <div className="absolute left-[23px] top-2 bottom-2 w-0.5 bg-border" />

              {milestones.map((m, i) => (
                <div key={i} className="flex gap-4 items-start relative pb-6 last:pb-0">
                  <div className="shrink-0 w-12 h-12 rounded-full bg-white border-2 border-tb-green flex items-center justify-center z-10">
                    <span className="text-xs font-bold text-tb-green">{m.year}</span>
                  </div>
                  <div className="pt-3">
                    <p className="text-sm text-foreground font-medium">{m.event}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Awards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
              <div className="rounded-xl border border-border bg-white p-4 text-center shadow-sm">
                <Award className="w-8 h-8 text-tb-orange mx-auto mb-2" />
                <p className="font-semibold text-sm">Lauréate Faso Digital</p>
                <p className="text-xs text-muted-foreground">Programme national d'innovation</p>
              </div>
              <div className="rounded-xl border border-border bg-white p-4 text-center shadow-sm">
                <Star className="w-8 h-8 text-tb-green mx-auto mb-2" />
                <p className="font-semibold text-sm">Lauréate POESAM</p>
                <p className="text-xs text-muted-foreground">Appui à l'entrepreneuriat</p>
              </div>
              <div className="rounded-xl border border-border bg-white p-4 text-center shadow-sm">
                <Globe className="w-8 h-8 text-tb-blue mx-auto mb-2" />
                <p className="font-semibold text-sm">Membre Orange Fab</p>
                <p className="text-xs text-muted-foreground">Accélérateur Orange BF</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Partenaires ──────────────────────────────────────── */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Nos Partenaires</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Des partenaires institutionnels et privés qui soutiennent notre vision.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {PARTNER_LOGOS.map((p) => (
              <div key={p.name} className="rounded-xl border border-border bg-background p-4 flex flex-col items-center justify-center gap-2 min-h-[100px]">
                {p.img ? (
                  <img
                    src={p.img}
                    alt={p.name}
                    className="h-10 w-auto object-contain"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-10 flex items-center">
                    <Handshake className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <p className="text-[10px] sm:text-xs text-muted-foreground text-center font-medium leading-tight">{p.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Technologie ──────────────────────────────────────── */}
      <section className="py-10 sm:py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Conçue pour l'Afrique</h2>
              <p className="text-muted-foreground">Une technologie adaptée aux réalités du terrain.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                <Zap className="w-6 h-6 text-tb-orange mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Optimisée 3G</h3>
                <p className="text-sm text-muted-foreground">Interface légère et rapide, conçue pour fonctionner même avec des connexions lentes.</p>
              </div>
              <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                <Zap className="w-6 h-6 text-tb-green mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Mobile-first</h3>
                <p className="text-sm text-muted-foreground">Pensée d'abord pour les smartphones d'entrée de gamme, les plus utilisés en Afrique de l'Ouest.</p>
              </div>
              <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                <Zap className="w-6 h-6 text-tb-blue mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Paiement USSD</h3>
                <p className="text-sm text-muted-foreground">Orange Money et Moov Money via USSD — fonctionne sans internet, accessible à tous.</p>
              </div>
              <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                <Zap className="w-6 h-6 text-tb-orange mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Multilingue</h3>
                <p className="text-sm text-muted-foreground">Disponible en français et anglais, avec préparation pour le Mooré et le Dioula.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-tb-green to-tb-green/90 py-12 sm:py-16">
        <div className="container text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Rejoignez l'aventure Terra Biga</h2>
          <p className="text-white/80 mb-6 max-w-md mx-auto">Ensemble, économisons et entraidons-nous en Afrique de l'Ouest.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/te-raga">
              <Button className="w-full sm:w-auto bg-white text-tb-green hover:bg-white/90 h-12 px-6 text-base rounded-xl gap-2 font-semibold">
                <ShoppingCart className="w-5 h-5" />
                Découvrir Te Raga
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
