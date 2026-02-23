import Layout from "@/components/Layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart, PiggyBank, Users, TrendingDown, ArrowRight,
  Star, Newspaper, ExternalLink, MessageCircle
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

export default function Home() {
  return (
    <Layout>
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-tb-green/5 to-tb-blue/5">
        <div className="container py-10 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-tb-green/10 text-tb-green text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                <Star className="w-3.5 h-3.5" />
                Lauréate Faso Digital & POESAM
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
                La première plateforme communautaire d'achat groupé et de cagnotte collective{" "}
                <span className="text-tb-green">en Afrique de l'Ouest</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground mb-6 max-w-lg leading-relaxed">
                Ensemble, on va plus loin. Économisez grâce à l'achat groupé et financez vos projets de vie avec la force du collectif.
              </p>

              {/* Stats inline */}
              <div className="flex flex-wrap gap-4 sm:gap-6 mb-6">
                <div>
                  <p className="text-2xl font-bold text-tb-green">1250+</p>
                  <p className="text-xs text-muted-foreground">Membres</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-tb-orange">30%</p>
                  <p className="text-xs text-muted-foreground">D'économie</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-tb-blue">8.5M</p>
                  <p className="text-xs text-muted-foreground">FCFA économisés</p>
                </div>
              </div>
            </div>

            {/* Hero image */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={HERO_IMG}
                  alt="Communauté Terra Biga"
                  className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                  loading="eager"
                />
              </div>
              {/* Floating savings badge */}
              <div className="absolute -bottom-4 -left-2 sm:left-4 bg-white rounded-xl shadow-lg p-3 border border-border">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-tb-green/10 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-tb-green" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Économie moyenne</p>
                    <p className="text-sm font-bold text-tb-green">-30% sur vos achats</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Two Pillars ──────────────────────────────────────── */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Nos deux services</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Deux solutions complémentaires pour le pouvoir d'achat et la solidarité communautaire.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Pillar 1: Achat Communautaire */}
            <div className="rounded-2xl border-2 border-tb-green/20 bg-gradient-to-b from-tb-green/5 to-white p-6 sm:p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-tb-green/10 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-tb-green" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Achat Communautaire</h3>
                  <p className="text-xs text-tb-green font-medium">Te Raga — "Viens acheter" en Mooré</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4 leading-relaxed flex-1">
                Rejoignez un groupe d'achat pour bénéficier de prix réduits sur des produits essentiels : kits solaires, fournitures scolaires, électronique, alimentaire. Plus on est nombreux, plus on économise !
              </p>

              <div className="bg-tb-green/5 rounded-xl p-4 mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-tb-green" />
                  <span className="text-sm font-semibold text-tb-green">Économie garantie</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Jusqu'à 30% d'économie grâce à la négociation collective. Paiement en 2 étapes : 10% d'avance, 90% à la collecte.
                </p>
              </div>

              <Link href="/te-raga">
                <Button className="w-full bg-tb-green hover:bg-tb-green/90 text-white h-12 rounded-xl text-base gap-2 font-semibold">
                  Découvrir Te Raga — Rejoindre un groupe d'achat
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Pillar 2: Financement Communautaire */}
            <div className="rounded-2xl border-2 border-tb-blue/20 bg-gradient-to-b from-tb-blue/5 to-white p-6 sm:p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-tb-blue/10 flex items-center justify-center">
                  <PiggyBank className="w-6 h-6 text-tb-blue" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Financement Communautaire</h3>
                  <p className="text-xs text-tb-blue font-medium">Ma Cagnotte — Cotiser ensemble</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4 leading-relaxed flex-1">
                Créez une cagnotte pour financer un projet de vie : mariage, santé, éducation, événement. Partagez le lien avec vos proches et recevez les contributions sur votre Mobile Money.
              </p>

              <div className="bg-tb-blue/5 rounded-xl p-4 mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-tb-blue" />
                  <span className="text-sm font-semibold text-tb-blue">Simple et gratuit</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Gratuit jusqu'à 50 000 FCFA. Partagez sur WhatsApp, Facebook, Telegram. Retrait direct sur Mobile Money.
                </p>
              </div>

              <Link href="/ma-cagnotte/creer">
                <Button className="w-full bg-tb-blue hover:bg-tb-blue/90 text-white h-12 rounded-xl text-base gap-2 font-semibold">
                  Lancer une cagnotte avec Ma Cagnotte
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Actualités ───────────────────────────────────────── */}
      <section className="py-10 sm:py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-tb-orange/10 flex items-center justify-center">
                <Newspaper className="w-5 h-5 text-tb-orange" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Actualités</h2>
            </div>
            <a
              href="https://terrabiga.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-tb-orange hover:underline hidden sm:flex items-center gap-1"
            >
              Voir tout <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {NEWS.map((article, i) => (
              <div key={i} className="tb-card hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-tb-orange bg-tb-orange/10 px-2 py-0.5 rounded-full">
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
            className="mt-4 text-sm text-tb-orange hover:underline flex sm:hidden items-center gap-1 justify-center"
          >
            Voir toutes les actualités <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

      {/* ─── Partenaires ──────────────────────────────────────── */}
      <section className="py-8 sm:py-12 bg-white border-y border-border">
        <div className="container">
          <p className="text-xs text-muted-foreground text-center mb-6 uppercase tracking-wider font-medium">
            Ils nous font confiance
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {PARTNERS.map((p) => (
              <div key={p.name} className="flex flex-col items-center gap-1.5">
                {p.img ? (
                  <img src={p.img} alt={p.name} className="h-10 sm:h-12 w-auto object-contain grayscale hover:grayscale-0 transition-all" loading="lazy" />
                ) : (
                  <div className="h-10 sm:h-12 flex items-center px-3">
                    <span className="text-xs font-semibold text-muted-foreground">{p.name}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WhatsApp CTA ─────────────────────────────────────── */}
      <section className="py-10 sm:py-14 bg-gradient-to-r from-tb-green to-tb-green/90">
        <div className="container text-center">
          <MessageCircle className="w-10 h-10 text-white/80 mx-auto mb-3" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Rejoignez notre communauté WhatsApp</h2>
          <p className="text-white/80 mb-6 max-w-md mx-auto text-sm sm:text-base">
            Restez informé des nouveaux groupes d'achat, des offres exclusives et des actualités Terra Biga.
          </p>
          <a
            href="https://chat.whatsapp.com/terrabiga"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="bg-white text-tb-green hover:bg-white/90 h-12 px-8 text-base rounded-xl gap-2 font-semibold">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Rejoindre le groupe WhatsApp
            </Button>
          </a>
        </div>
      </section>
    </Layout>
  );
}
