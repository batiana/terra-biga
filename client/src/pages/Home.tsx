import Layout from "@/components/Layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart, PiggyBank, Users, TrendingDown, ArrowRight,
  Star, Newspaper, ExternalLink, MessageCircle, CheckCircle2, Zap, Heart
} from "lucide-react";

const HERO_IMG = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663373135176/SeumZExYlmhgMMDS.jpg";
const LOGO_FULL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663373135176/CVgkfXXzqFTyhJrb.png";

const PARTNERS = [
  { name: "Orange", img: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663373135176/XmecCmcJFPBQqWKs.jpg" },
  { name: "Lefaso.net", img: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663373135176/LIMdWQToaKOTXBrA.jpg" },
  { name: "Kéré Architecture", img: null },
  { name: "Min. des Finances", img: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663373135176/JQvbdegyDYprWWUG.jpg" },
  { name: "PNUD", img: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663373135176/VTjHBhKifUCRZnBS.jpg" },
  { name: "Min. Transition Digitale", img: null },
];

const NEWS = [
  {
    title: "Terra Invest présente Terra Biga au Village des Startups – Semaine du Numérique 2025",
    date: "26 Nov 2025",
    tag: "Événement",
  },
  {
    title: "Terra Biga : Le crowdfunding réinvente le financement communautaire au Burkina Faso",
    date: "28 Oct 2025",
    tag: "Presse",
  },
  {
    title: "Terra Biga primée au Faso Digital 2025 : vers un nouveau modèle de financement communautaire",
    date: "2025",
    tag: "Récompense",
  },
  {
    title: "Terra Invest, parmi les 5 startups burkinabè sélectionnées par Orange Fab (4e saison)",
    date: "2024",
    tag: "Accélérateur",
  },
  {
    title: "POESAM25 : Terra Biga lauréat du 2e prix national",
    date: "2024",
    tag: "Récompense",
  },
  {
    title: "Rencontre avec Mme le Ministre de la Transition Digitale : cap sur le financement participatif",
    date: "2024",
    tag: "Institutionnel",
  },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Rejoignez ou créez",
    description: "Adhérez à un groupe d'achat ou lancez une cagnotte en quelques clics",
    icon: Users,
  },
  {
    step: 2,
    title: "Partagez avec vos proches",
    description: "Invitez vos amis et famille via WhatsApp, Facebook ou lien direct",
    icon: MessageCircle,
  },
  {
    step: 3,
    title: "Économisez ensemble",
    description: "Bénéficiez de tarifs réduits ou recevez les contributions",
    icon: TrendingDown,
  },
  {
    step: 4,
    title: "Retirez sur Mobile Money",
    description: "Accédez à votre argent directement sur votre compte Orange Money",
    icon: Zap,
  },
];

export default function Home() {
  return (
    <Layout>
      {/* ─── Hero Section ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-tb-green/10 via-white to-tb-blue/10" style={{
        backgroundImage: `linear-gradient(to right, rgba(11,22,40,0.75) 50%, transparent 100%), url('${HERO_IMG}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}>
        <div className="container py-12 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-tb-green/10 text-tb-green text-xs font-semibold px-3 py-1.5 rounded-full">
                <Star className="w-3.5 h-3.5" />
                Lauréate Faso Digital & POESAM
              </div>

              {/* Main Headline */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Ensemble, on va plus loin.
                </h1>
                <h2 className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl">
                  Première plateforme communautaire d'achat groupé et de financement collectif au Burkina Faso.
                </h2>
              </div>



              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="space-y-1">
                  <p className="text-2xl sm:text-3xl font-bold text-tb-green">600+</p>
                  <p className="text-xs text-muted-foreground">Contributions</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl sm:text-3xl font-bold text-tb-orange">9M</p>
                  <p className="text-xs text-muted-foreground">FCFA mobilisés</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl sm:text-3xl font-bold text-tb-blue">1250+</p>
                  <p className="text-xs text-muted-foreground">Membres actifs</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Link href="/te-raga">
                  <Button className="w-full sm:w-auto bg-tb-green hover:bg-tb-green/90 text-white h-12 rounded-xl text-base gap-2 font-semibold px-6">
                    Découvrir Te Raga
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/ma-cagnotte/creer">
                  <Button variant="outline" className="w-full sm:w-auto h-12 rounded-xl text-base font-semibold px-6">
                    Créer une cagnotte
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative hidden lg:block">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={HERO_IMG}
                  alt="Communauté Terra Biga"
                  className="w-full h-96 object-cover"
                  loading="eager"
                />
              </div>
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-4 sm:left-4 bg-white rounded-xl shadow-lg p-4 border border-border max-w-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-tb-green/10 flex items-center justify-center flex-shrink-0">
                    <TrendingDown className="w-5 h-5 text-tb-green" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Économie moyenne</p>
                    <p className="text-sm font-bold text-tb-green">-30% sur vos achats</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Two Services Section ─────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Nos deux services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Deux solutions complémentaires pour le pouvoir d'achat et la solidarité communautaire.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Service 1: Te Raga */}
            <div className="rounded-2xl border-2 border-tb-green/20 bg-gradient-to-b from-tb-green/5 to-white p-8 flex flex-col hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-tb-green/10 flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="w-7 h-7 text-tb-green" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Te Raga</h3>
                  <p className="text-sm text-tb-green font-medium">"Viens acheter" en Mooré</p>
                </div>
              </div>

              <p className="text-base text-muted-foreground mb-6 leading-relaxed flex-1">
                Rejoignez des groupes d'achat pour bénéficier de prix réduits sur des produits essentiels : kits solaires, fournitures scolaires, électronique, alimentaire.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-tb-green flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-foreground">Économies garanties</p>
                    <p className="text-xs text-muted-foreground">Jusqu'à 30% d'économie grâce à la négociation collective</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-tb-green flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-foreground">Paiement flexible</p>
                    <p className="text-xs text-muted-foreground">10% d'avance, 90% à la collecte</p>
                  </div>
                </div>
              </div>

              <Link href="/te-raga">
                <Button className="w-full bg-tb-green hover:bg-tb-green/90 text-white h-12 rounded-xl font-semibold gap-2">
                  Rejoindre un groupe d'achat
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Service 2: Ma Cagnotte */}
            <div className="rounded-2xl border-2 border-tb-blue/20 bg-gradient-to-b from-tb-blue/5 to-white p-8 flex flex-col hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-tb-blue/10 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-7 h-7 text-tb-blue" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Ma Cagnotte</h3>
                  <p className="text-sm text-tb-blue font-medium">Financement collectif</p>
                </div>
              </div>

              <p className="text-base text-muted-foreground mb-6 leading-relaxed flex-1">
                Créez une cagnotte pour financer vos projets de vie : mariage, santé, éducation, événement. Partagez avec vos proches et recevez les contributions directement.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-tb-blue flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-foreground">Simple et gratuit</p>
                    <p className="text-xs text-muted-foreground">Gratuit jusqu'à 50 000 FCFA</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-tb-blue flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-foreground">Retrait direct</p>
                    <p className="text-xs text-muted-foreground">Sur votre compte Orange Money</p>
                  </div>
                </div>
              </div>

              <Link href="/ma-cagnotte/creer">
                <Button className="w-full bg-tb-blue hover:bg-tb-blue/90 text-white h-12 rounded-xl font-semibold gap-2">
                  Créer une cagnotte
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works Section ─────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-tb-green/5 to-white">
        <div className="container">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Comment ça marche ?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Quatre étapes simples pour commencer votre aventure Terra Biga
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="relative">
                  {/* Connector line */}
                  {idx < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-tb-green/30 to-transparent" />
                  )}

                  <div className="relative bg-white rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-full bg-tb-green/10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-tb-green" />
                      </div>
                      <span className="text-2xl font-bold text-tb-green/30">{item.step}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Actualités Section ───────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-tb-orange/10 flex items-center justify-center">
                <Newspaper className="w-6 h-6 text-tb-orange" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Actualités</h2>
            </div>
            <a
              href="https://terrabiga.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-tb-orange hover:underline hidden sm:flex items-center gap-1 font-medium"
            >
              Voir tout <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {NEWS.map((article, i) => (
              <div key={i} className="tb-card hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-tb-orange bg-tb-orange/10 px-2.5 py-1 rounded-full">
                    {article.tag}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{article.date}</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-3">
                  {article.title}
                </h3>
              </div>
            ))}
          </div>

          <a
            href="https://terrabiga.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 text-sm text-tb-orange hover:underline flex sm:hidden items-center gap-1 justify-center font-medium"
          >
            Voir toutes les actualités <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* ─── Partners Section ─────────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-white border-t border-border">
        <div className="container">
          <p className="text-xs text-muted-foreground text-center mb-8 uppercase tracking-wider font-semibold">
            Ils nous font confiance
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {PARTNERS.map((partner, i) => (
              <div key={i} className="flex items-center justify-center h-12">
                {partner.img ? (
                  <img src={partner.img} alt={partner.name} className="h-8 object-contain opacity-70 hover:opacity-100 transition-opacity" />
                ) : (
                  <span className="text-xs font-semibold text-muted-foreground">{partner.name}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA Section ────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-tb-green/10 to-tb-blue/10">
        <div className="container text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Prêt à rejoindre la communauté ?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Commencez dès aujourd'hui à économiser et à financer vos projets de vie avec Terra Biga.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link href="/te-raga">
              <Button className="bg-tb-green hover:bg-tb-green/90 text-white h-12 rounded-xl text-base font-semibold px-8">
                Découvrir Te Raga
              </Button>
            </Link>
            <Link href="/ma-cagnotte/creer">
              <Button variant="outline" className="h-12 rounded-xl text-base font-semibold px-8">
                Créer une cagnotte
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
