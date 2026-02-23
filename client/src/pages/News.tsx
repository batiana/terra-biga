import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  categoryColor: string;
  image?: string;
}

const newsItems: NewsItem[] = [
  {
    id: 1,
    title: "Terra Invest présente Terra Biga au Village des Startups – Semaine du Numérique 2025",
    excerpt: "Découvrez comment Terra Biga révolutionne le financement communautaire en Afrique de l'Ouest lors de la Semaine du Numérique 2025.",
    date: "26 NOV 2025",
    category: "Événement",
    categoryColor: "bg-tb-blue/10 text-tb-blue",
  },
  {
    id: 2,
    title: "Terra Biga : Le crowdfunding réinvente le financement communautaire au Burkina Faso",
    excerpt: "Comment la plateforme Terra Biga transforme la façon dont les communautés locales financent leurs projets de développement.",
    date: "28 OCT 2025",
    category: "Actualité",
    categoryColor: "bg-tb-green/10 text-tb-green",
  },
  {
    id: 3,
    title: "Terra Biga primée au Faso Digital 2025 : vers un nouveau modèle de financement communautaire en Afrique",
    excerpt: "Terra Biga remporte une distinction majeure au Faso Digital 2025, confirmant son rôle de leader dans le financement participatif en Afrique.",
    date: "15 OCT 2025",
    category: "Récompense",
    categoryColor: "bg-tb-orange/10 text-tb-orange",
  },
  {
    id: 4,
    title: "Terra Invest, parmi les 5 startups burkinabè sélectionnées par Orange Fab pour sa 4e saison",
    excerpt: "Terra Invest est sélectionnée par Orange Fab, le programme d'accélération d'Orange, pour sa 4e saison en Afrique de l'Ouest.",
    date: "05 SEP 2025",
    category: "Partenariat",
    categoryColor: "bg-tb-blue/10 text-tb-blue",
  },
  {
    id: 5,
    title: "POESAM25 : Terra Biga lauréat du 2e prix national",
    excerpt: "Terra Biga remporte le 2e prix national au concours POESAM25, reconnaissant son impact dans l'entrepreneuriat social.",
    date: "20 AUG 2025",
    category: "Récompense",
    categoryColor: "bg-tb-orange/10 text-tb-orange",
  },
  {
    id: 6,
    title: "Rencontre avec le Ministre de la Santé",
    excerpt: "Terra Biga rencontre le Ministre de la Santé pour discuter de l'intégration du financement participatif dans les projets de santé publique.",
    date: "10 AUG 2025",
    category: "Gouvernance",
    categoryColor: "bg-tb-green/10 text-tb-green",
  },
  {
    id: 7,
    title: "Rencontre avec Mme le Ministre de la Transition Digitale : cap sur le financement participatif",
    excerpt: "Échange stratégique avec le Ministère de la Transition Digitale pour développer les solutions de financement participatif numériques.",
    date: "05 AUG 2025",
    category: "Gouvernance",
    categoryColor: "bg-tb-green/10 text-tb-green",
  },
  {
    id: 8,
    title: "Forum Gouvernement – Secteur privé – Groupe Banque mondiale : Terra Biga plaide pour le financement participatif",
    excerpt: "Terra Biga intervient au forum tripartite pour promouvoir le financement participatif comme levier de développement durable.",
    date: "25 JUL 2025",
    category: "Plaidoyer",
    categoryColor: "bg-tb-blue/10 text-tb-blue",
  },
  {
    id: 9,
    title: "#TibgaVidéoChallenge : Exprime ton engagement en vidéo !",
    excerpt: "Participez au challenge vidéo Tibga et montrez comment vous contribuez au développement de votre communauté.",
    date: "15 JUL 2025",
    category: "Engagement",
    categoryColor: "bg-tb-orange/10 text-tb-orange",
  },
  {
    id: 10,
    title: "Lancement du projet de maternité et laboratoire à Tibga : Une initiative solidaire pour le développement durable",
    excerpt: "Découvrez le projet phare de Terra Biga : la construction d'une maternité et d'un laboratoire à Tibga pour améliorer l'accès à la santé.",
    date: "01 JUL 2025",
    category: "Projet",
    categoryColor: "bg-tb-green/10 text-tb-green",
  },
];

export default function News() {
  return (
    <Layout>
      <div className="container py-6 sm:py-10">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
        </Link>

        {/* Header */}
        <div className="mb-10 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Actualités</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Restez informé des dernières nouvelles, événements et réalisations de Terra Biga.
          </p>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {newsItems.map((item) => (
            <div
              key={item.id}
              className="group rounded-xl border border-border bg-white hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
            >
              {/* Image placeholder */}
              <div className="h-40 bg-gradient-to-br from-tb-orange/10 via-tb-green/5 to-tb-blue/10 flex items-center justify-center group-hover:from-tb-orange/15 transition-colors">
                <div className="text-center">
                  <Calendar className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground/50">{item.date}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className={`${item.categoryColor} border-0 text-xs`}>
                    {item.category}
                  </Badge>
                </div>

                <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-tb-green transition-colors">
                  {item.title}
                </h3>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {item.excerpt}
                </p>

                <div className="flex items-center gap-2 text-sm text-tb-blue font-medium group-hover:gap-3 transition-all">
                  Lire plus
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="rounded-2xl bg-gradient-to-r from-tb-blue/5 to-tb-green/5 border border-border p-8 sm:p-10 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">Abonnez-vous à nos actualités</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Recevez les dernières nouvelles de Terra Biga directement dans votre boîte mail.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="votre@email.com"
              className="flex-1 px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
            <Button className="bg-tb-green hover:bg-tb-green/90 text-white rounded-lg px-6 h-11">
              S'abonner
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
