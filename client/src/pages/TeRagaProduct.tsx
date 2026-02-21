import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { useRoute, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ShoppingCart, Users, MapPin, ArrowRight, ArrowLeft,
  CreditCard, Shield, CheckCircle
} from "lucide-react";
import { useState, useMemo } from "react";

function formatFCFA(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

export default function TeRagaProduct() {
  const [, params] = useRoute("/te-raga/:slug");
  const slug = params?.slug ?? "";
  const [, navigate] = useLocation();

  const productQuery = trpc.products.bySlug.useQuery({ slug }, { enabled: !!slug });
  const groupsQuery = trpc.groups.list.useQuery({ productId: productQuery.data?.id }, {
    enabled: !!productQuery.data?.id,
  });

  const group = useMemo(() => {
    if (!groupsQuery.data?.length) return null;
    return groupsQuery.data[0];
  }, [groupsQuery.data]);

  const product = productQuery.data;

  if (productQuery.isLoading) {
    return (
      <Layout>
        <div className="container py-6">
          <Skeleton className="h-48 rounded-xl mb-4" />
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          <Skeleton className="h-12 w-full" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">Produit introuvable</p>
          <Link href="/te-raga">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Retour au catalogue
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const contents = Array.isArray(product.contents) ? product.contents as string[] : [];
  const advanceAmount = Math.round(product.groupPrice * 0.1);
  const remainingAmount = product.groupPrice - advanceAmount;
  const percent = group ? Math.round((group.currentMembers / group.maxMembers) * 100) : 0;

  return (
    <Layout>
      <div className="container py-6 sm:py-10">
        {/* Back */}
        <Link href="/te-raga" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Retour au catalogue
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          {/* Image */}
          <div className="h-52 sm:h-72 rounded-xl bg-gradient-to-br from-tb-orange/10 to-tb-green/10 flex items-center justify-center">
            <ShoppingCart className="w-16 h-16 text-tb-green/20" />
          </div>

          {/* Details */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{product.name}</h1>
            <p className="text-muted-foreground mb-4">{product.description}</p>

            {/* Contents */}
            {contents.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-sm mb-2 text-foreground">Contenu du pack :</h3>
                <ul className="space-y-1">
                  {contents.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-tb-green shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pricing */}
            <div className="tb-card mb-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg text-muted-foreground line-through">{formatFCFA(product.standardPrice)}</span>
                <span className="text-2xl font-bold text-tb-green">{formatFCFA(product.groupPrice)}</span>
                <Badge className="bg-tb-green/10 text-tb-green border-0">-{product.discount}%</Badge>
              </div>
              <div className="bg-tb-green/5 rounded-lg p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avance 10% maintenant</span>
                  <span className="font-semibold text-tb-green">{formatFCFA(advanceAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Solde 90% à la collecte</span>
                  <span className="font-semibold">{formatFCFA(remainingAmount)}</span>
                </div>
              </div>
            </div>

            {/* Group Progress */}
            {group && (
              <div className="tb-card mb-4">
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-tb-green" />
                  Groupe actuel
                </h3>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{group.currentMembers}/{group.maxMembers} membres</span>
                  <span className="font-medium text-tb-green">{percent}%</span>
                </div>
                <Progress value={percent} className="h-2.5 mb-2" />
                <p className="text-xs text-muted-foreground">Le groupe se remplit — rejoignez maintenant !</p>
              </div>
            )}

            {/* Collection Point */}
            <div className="tb-card mb-6">
              <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-tb-orange" />
                Point de collecte
              </h3>
              <p className="text-sm text-muted-foreground">Dépôt Terra Biga — ZAD, Ouagadougou</p>
            </div>

            {/* CTA */}
            <Link href={group ? `/te-raga/groupe/${group.id}` : "/te-raga"}>
              <Button className="w-full bg-tb-green hover:bg-tb-green/90 text-white h-12 rounded-xl text-base gap-2">
                Rejoindre ce groupe <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
