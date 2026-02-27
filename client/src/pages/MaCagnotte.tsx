import Layout from "@/components/Layout";
import ShareCagnotte from "@/components/ShareCagnotte";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { PiggyBank, Plus, ArrowRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { CAGNOTTE_CATEGORIES } from "@shared/types";

function formatFCFA(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

export default function MaCagnotte() {
  const cagnottesQuery = trpc.cagnottes.list.useQuery();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  const filtered = useMemo(() => {
    if (!cagnottesQuery.data) return [];
    return cagnottesQuery.data.filter((c) => {
      const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
      const matchCat = !selectedCategory || c.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [cagnottesQuery.data, search, selectedCategory]);

  return (
    <Layout>
      <section className="container py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="tb-heading mb-1">Ma Cagnotte</h1>
            <p className="text-muted-foreground">Cotisez ensemble pour vos projets</p>
          </div>
          <Link href="/ma-cagnotte/creer">
            <Button className="bg-tb-blue hover:bg-tb-blue/90 text-white rounded-xl gap-2 h-11">
              <Plus className="w-5 h-5" /> Créer une cagnotte
            </Button>
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="mb-6">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une cagnotte..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-xl"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(undefined)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                !selectedCategory ? "bg-tb-blue text-white border-tb-blue" : "bg-white text-foreground border-border hover:border-tb-blue/50"
              }`}
            >
              Toutes
            </button>
            {CAGNOTTE_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key === selectedCategory ? undefined : cat.key)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1 transition-colors ${
                  selectedCategory === cat.key ? "bg-tb-blue text-white border-tb-blue" : "bg-white text-foreground border-border hover:border-tb-blue/50"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cagnotte Grid */}
        {cagnottesQuery.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="tb-card">
                <Skeleton className="h-5 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-full mb-3" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((cagnotte) => {
              const percent = cagnotte.targetAmount && cagnotte.targetAmount > 0
                ? Math.min(Math.round((cagnotte.currentAmount / cagnotte.targetAmount) * 100), 100)
                : 0;
              const catInfo = CAGNOTTE_CATEGORIES.find((c) => c.key === cagnotte.category);

              return (
                <div key={cagnotte.id} className="tb-card flex flex-col">
                  {/* Category + Share icon */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-tb-blue/10 text-tb-blue font-medium">
                      {catInfo?.icon} {catInfo?.label || cagnotte.category}
                    </span>
                    <ShareCagnotte cagnotte={cagnotte} variant="icon" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{cagnotte.title}</h3>
                  {cagnotte.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{cagnotte.description}</p>
                  )}
                  <div className="mt-auto">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-tb-green">{formatFCFA(cagnotte.currentAmount)}</span>
                      <span className="text-muted-foreground">{percent}%</span>
                    </div>
                    <Progress value={percent} className="h-2.5 mb-1" />
                    <p className="text-xs text-muted-foreground mb-3">
                      Objectif : {formatFCFA(cagnotte.targetAmount ?? 0)} &middot; {cagnotte.contributorsCount} contributeurs
                    </p>
                    <Link href={`/ma-cagnotte/${cagnotte.id}`}>
                      <Button className="w-full bg-tb-blue hover:bg-tb-blue/90 text-white rounded-xl h-10 gap-2 text-sm">
                        Contribuer <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <PiggyBank className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">Aucune cagnotte trouvée</p>
            <Link href="/ma-cagnotte/creer">
              <Button className="bg-tb-blue hover:bg-tb-blue/90 text-white rounded-xl gap-2">
                <Plus className="w-4 h-4" /> Créer la première
              </Button>
            </Link>
          </div>
        )}
      </section>
    </Layout>
  );
}
