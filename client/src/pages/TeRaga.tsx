import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Clock, Users, ArrowRight } from "lucide-react";
import { PRODUCT_CATEGORIES } from "@shared/types";
import { useState, useMemo } from "react";

function formatFCFA(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

export default function TeRaga() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const productsQuery = trpc.products.list.useQuery({ category: selectedCategory });
  const groupsQuery = trpc.groups.list.useQuery({});

  const groupsByProduct = useMemo(() => {
    const map: Record<number, any> = {};
    if (groupsQuery.data) {
      for (const g of groupsQuery.data) {
        if (!map[g.productId] || g.currentMembers > map[g.productId].currentMembers) {
          map[g.productId] = g;
        }
      }
    }
    return map;
  }, [groupsQuery.data]);

  return (
    <Layout>
      <section className="container py-6 sm:py-10">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="tb-heading mb-2">Te Raga</h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Achat groupé, commandez, économisez, collectez !
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(undefined)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
              !selectedCategory ? "bg-tb-green text-white border-tb-green" : "bg-white text-foreground border-border hover:border-tb-green/50"
            }`}
          >
            Tous
          </button>
          {PRODUCT_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key === selectedCategory ? undefined : cat.key)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors border flex items-center gap-1.5 ${
                selectedCategory === cat.key ? "bg-tb-green text-white border-tb-green" : "bg-white text-foreground border-border hover:border-tb-green/50"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {productsQuery.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="tb-card">
                <Skeleton className="h-40 rounded-lg mb-3" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-3" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        ) : productsQuery.data && productsQuery.data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {productsQuery.data.map((product) => {
              const group = groupsByProduct[product.id];
              const percent = group ? Math.round((group.currentMembers / group.maxMembers) * 100) : 0;
              const contents = Array.isArray(product.contents) ? product.contents : [];

              return (
                <div key={product.id} className="tb-card flex flex-col">
                  {/* Image placeholder */}
                  <div className="h-36 sm:h-44 rounded-lg bg-gradient-to-br from-tb-orange/10 to-tb-green/10 flex items-center justify-center mb-3">
                    <ShoppingCart className="w-10 h-10 text-tb-green/30" />
                  </div>

                  <h3 className="font-semibold text-foreground mb-1 line-clamp-2">{product.name}</h3>

                  {/* Contents */}
                  {contents.length > 0 && (
                    <ul className="text-xs text-muted-foreground mb-2 space-y-0.5">
                      {(contents as string[]).slice(0, 3).map((item, i) => (
                        <li key={i} className="flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-tb-green shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Pricing */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-muted-foreground line-through">{formatFCFA(product.standardPrice)}</span>
                    <span className="text-lg font-bold text-tb-green">{formatFCFA(product.groupPrice)}</span>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <Badge className="bg-tb-green/10 text-tb-green border-0 text-xs">
                      Économie -{product.discount}%
                    </Badge>
                    <Badge className="bg-tb-orange/10 text-tb-orange border-0 text-xs">
                      Économie collective
                    </Badge>
                  </div>

                  {/* Group Progress */}
                  {group && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-3 h-3" />
                          {group.currentMembers}/{group.maxMembers} membres
                        </span>
                        <span className="font-medium text-tb-green">{percent}%</span>
                      </div>
                      <Progress value={percent} className="h-2" />
                    </div>
                  )}

                  <div className="mt-auto">
                    <Link href={`/te-raga/${product.slug}`}>
                      <Button className="w-full bg-tb-green hover:bg-tb-green/90 text-white rounded-xl h-11 gap-2">
                        Rejoindre le groupe <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Aucun produit disponible pour le moment.</p>
          </div>
        )}
      </section>
    </Layout>
  );
}
