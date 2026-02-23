import Layout from "@/components/Layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Globe, Award, Users, Heart, Shield, Zap, Target,
  ShoppingCart, PiggyBank, ArrowRight, Star, Lightbulb, Handshake, Eye
} from "lucide-react";

const LOGO_FULL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663373135176/CVgkfXXzqFTyhJrb.png";

const PARTNER_LOGOS = [
  { name: "Orange", img: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663373135176/XmecCmcJFPBQqWKs.jpg" },
  { name: "Lefaso.net", img: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663373135176/LIMdWQToaKOTXBrA.jpg" },
  { name: "Kéré Architecture", img: null },
  { name: "Ministère des Finances", img: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663373135176/JQvbdegyDYprWWUG.jpg" },
  { name: "PNUD Burkina Faso", img: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663373135176/VTjHBhKifUCRZnBS.jpg" },
  { name: "Ministère de la Transition Digitale", img: null },
];

const values = [
  { icon: <Users className="w-6 h-6 text-tb-green" />, title: "Communauté", description: "La force du collectif est au cœur de tout ce que nous faisons. La collaboration entre habitants, partenaires et diaspora." },
  { icon: <Shield className="w-6 h-6 text-tb-blue" />, title: "Confiance", description: "Transparence totale dans les collectes et le suivi public des projets. Chaque transaction est traçable." },
  { icon: <Lightbulb className="w-6 h-6 text-tb-orange" />, title: "Innovation", description: "Des solutions technologiques adaptées au contexte africain : USSD, Mobile Money, optimisation 3G." },
  { icon: <Heart className="w-6 h-6 text-tb-green" />, title: "Solidarité", description: "Faciliter l'entraide entre les membres de la communauté, pour que personne ne soit laissé de côté." },
  { icon: <Target className="w-6 h-6 text-tb-blue" />, title: "Durabilité", description: "Des actions à long terme, respectueuses de l'environnement et des valeurs locales." },
  { icon: <Handshake className="w-6 h-6 text-tb-orange" />, title: "Impact local", description: "Chaque transaction renforce l'économie locale et crée de la valeur pour la communauté." },
];

const milestones = [
  { year: "2020", event: "Création de Terra Invest SA à Ouagadougou" },
  { year: "2023", event: "Lancement de la plateforme Terra Biga" },
  { year: "2023", event: "Lauréate du programme Faso Digital" },
  { year: "2024", event: "Lauréate POESAM — 2e prix national" },
  { year: "2024", event: "Intégration au programme Orange Fab Burkina Faso (4e saison)" },
  { year: "2024", event: "Partenariat avec Lefaso.net pour la visibilité médiatique" },
  { year: "2024", event: "Rencontre avec le Ministre de la Santé et la Ministre de la Transition Digitale" },
  { year: "2025", event: "Présentation au Village des Startups — Semaine du Numérique 2025" },
  { year: "2025", event: "Lancement de Te Raga (achat groupé) & Ma Cagnotte (financement collectif)" },
  { year: "2025", event: "Partenariats institutionnels (PNUD, Ministères, Banque mondiale)" },
];

export default function APropos() {
  return (
    <Layout>
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-tb-green/5 via-background to-tb-blue/5 py-12 sm:py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <img src={LOGO_FULL} alt="Terra Biga" className="h-16 sm:h-20 mx-auto mb-6" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
              Nous croyons au pouvoir du <span className="text-tb-green">collectif</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Là où les projets prennent vie grâce à nous tous.
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
                <span className="font-bold text-tb-green">Terra Biga</span> est née d'une conviction simple : le développement durable de l'Afrique ne viendra pas d'ailleurs, mais de nous-mêmes. Face aux besoins urgents dans nos communautés — accès à la santé, à l'éducation, à l'eau, à l'emploi — nous avons choisi d'agir autrement : en reliant les forces locales et la diaspora, autour de projets concrets et porteurs d'espoir.
              </p>
              <p>
                Terra Biga n'est pas qu'une plateforme de financement participatif. C'est une communauté d'acteurs engagés : des porteurs de projets locaux, des citoyens solidaires, des entrepreneurs, et une diaspora prête à soutenir des initiatives à impact.
              </p>
              <p>
                Notre stratégie est de mettre en relation des porteurs de projets de développement avec des investisseurs, afin de facilement mobiliser aussi bien des ressources locales, au travers des communautés, qu'à l'international avec la diaspora.
              </p>
              <p>
                <span className="font-semibold">"Te Raga"</span> signifie <span className="italic">"viens acheter"</span> en Mooré, la langue la plus parlée au Burkina Faso. C'est l'esprit de notre plateforme : ensemble, on achète mieux, on économise plus, et on va plus loin.
              </p>
            </div>

            {/* Key figures */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              <div className="rounded-xl bg-tb-green/5 border border-tb-green/20 p-4 text-center">
                <p className="text-2xl font-bold text-tb-green">5+</p>
                <p className="text-xs text-muted-foreground mt-1">Ans d'expérience</p>
              </div>
              <div className="rounded-xl bg-tb-blue/5 border border-tb-blue/20 p-4 text-center">
                <p className="text-2xl font-bold text-tb-blue">1250+</p>
                <p className="text-xs text-muted-foreground mt-1">Membres actifs</p>
              </div>
              <div className="rounded-xl bg-tb-orange/5 border border-tb-orange/20 p-4 text-center">
                <p className="text-2xl font-bold text-tb-orange">8.5M</p>
                <p className="text-xs text-muted-foreground mt-1">FCFA économisés</p>
              </div>
              <div className="rounded-xl bg-tb-green/5 border border-tb-green/20 p-4 text-center">
                <p className="text-2xl font-bold text-tb-green">6</p>
                <p className="text-xs text-muted-foreground mt-1">Partenaires clés</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trois Piliers ────────────────────────────────────── */}
      <section className="py-10 sm:py-16">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Notre démarche</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Trois piliers essentiels guident notre action.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm text-center">
              <Shield className="w-8 h-8 text-tb-green mx-auto mb-3" />
              <h3 className="font-bold text-foreground mb-2">Confiance</h3>
              <p className="text-sm text-muted-foreground">Transparence dans les collectes et suivi public des projets.</p>
            </div>
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm text-center">
              <Users className="w-8 h-8 text-tb-blue mx-auto mb-3" />
              <h3 className="font-bold text-foreground mb-2">Communauté</h3>
              <p className="text-sm text-muted-foreground">Collaboration entre habitants, partenaires et diaspora.</p>
            </div>
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm text-center">
              <Heart className="w-8 h-8 text-tb-orange mx-auto mb-3" />
              <h3 className="font-bold text-foreground mb-2">Durabilité</h3>
              <p className="text-sm text-muted-foreground">Actions à long terme, respectueuses de l'environnement et des valeurs locales.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Nos Valeurs ──────────────────────────────────────── */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Nos Valeurs</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border border-border bg-background p-5 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-background flex items-center justify-center mb-3 border border-border">
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
      <section className="py-10 sm:py-16">
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
                Rejoignez un groupe d'achat pour bénéficier de prix réduits sur des produits essentiels. Économisez jusqu'à 30% grâce à la force du collectif.
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
                Créez une cagnotte pour financer un projet de vie : mariage, santé, éducation, événement. Partagez le lien et recevez les contributions sur Mobile Money.
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

      {/* ─── Fondateur ────────────────────────────────────────── */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Le Fondateur</h2>
            </div>
            <div className="rounded-2xl border border-border bg-gradient-to-br from-tb-green/5 to-tb-blue/5 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="w-20 h-20 rounded-full bg-tb-green/10 flex items-center justify-center shrink-0">
                  <Users className="w-10 h-10 text-tb-green" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1 text-center sm:text-left">Batiana Ismaail Franck Nacro</h3>
                  <p className="text-sm text-tb-green font-medium mb-3 text-center sm:text-left">Cofondateur & CEO — Terra Invest SA</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Économiste et entrepreneur burkinabè, cofondateur et responsable de Terra Invest SA, une entreprise évoluant à l'intersection de l'immobilier et des technologies financières (Fintech). Avec plus de 5 ans d'expérience dans l'accompagnement du financement communautaire, il porte la vision d'une Afrique qui se développe par elle-même.
                  </p>
                </div>
              </div>
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
                <p className="text-xs text-muted-foreground">2e prix national</p>
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

      {/* ─── Projets réalisés ─────────────────────────────────── */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Projets réalisés</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Des projets concrets qui transforment les communautés.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { name: "DIAPANGOU", desc: "Construction de 6 classes", cat: "Éducation" },
              { name: "FORAGE RAYONGO", desc: "Accès à l'eau potable", cat: "Eau" },
              { name: "LYCÉE RAYONGO", desc: "Infrastructure scolaire", cat: "Éducation" },
              { name: "TIBGA Maternité", desc: "Construction maternité & laboratoire", cat: "Santé" },
            ].map((p) => (
              <div key={p.name} className="rounded-2xl border border-border bg-background p-5 shadow-sm">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-tb-blue bg-tb-blue/10 px-2 py-0.5 rounded-full">
                  {p.cat}
                </span>
                <h3 className="font-bold text-foreground mt-3 mb-1">{p.name}</h3>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Partenaires ──────────────────────────────────────── */}
      <section className="py-10 sm:py-16">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Nos Partenaires</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Des partenaires institutionnels et privés qui soutiennent notre vision.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {PARTNER_LOGOS.map((p) => (
              <div key={p.name} className="rounded-xl border border-border bg-white p-4 flex flex-col items-center justify-center gap-2 min-h-[100px]">
                {p.img ? (
                  <img src={p.img} alt={p.name} className="h-10 w-auto object-contain" loading="lazy" />
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

      {/* ─── CTA ──────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-tb-green to-tb-green/90 py-12 sm:py-16">
        <div className="container text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Rejoignez l'aventure Terra Biga</h2>
          <p className="text-white/80 mb-6 max-w-md mx-auto">Chaque don, chaque partage, chaque projet est une brique posée pour construire l'Afrique de demain.</p>
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
