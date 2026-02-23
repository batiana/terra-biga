import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { useRoute, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingCart, Users, MapPin, ArrowRight, ArrowLeft,
  CheckCircle, Share2, MessageCircle, Send
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

function formatFCFA(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

function ShareButtons({ title, url }: { title: string; url: string }) {
  const text = `${title} — Découvrez ce produit sur Terra Biga et économisez grâce à l'achat groupé !`;
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Lien copié !");
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted-foreground font-medium">Partager :</span>
      <a
        href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/20 flex items-center justify-center transition-colors"
        title="WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#25D366]" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 rounded-full bg-[#1877F2]/10 hover:bg-[#1877F2]/20 flex items-center justify-center transition-colors"
        title="Facebook"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#1877F2]" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 rounded-full bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center transition-colors"
        title="X / Twitter"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 text-foreground" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      <button
        onClick={handleNativeShare}
        className="w-9 h-9 rounded-full bg-tb-green/10 hover:bg-tb-green/20 flex items-center justify-center transition-colors"
        title="Copier le lien"
      >
        <Share2 className="w-4 h-4 text-tb-green" />
      </button>
    </div>
  );
}

export default function TeRagaProduct() {
  const [, params] = useRoute("/te-raga/:slug");
  const slug = params?.slug ?? "";
  const [, navigate] = useLocation();

  const productQuery = trpc.products.bySlug.useQuery({ slug }, { enabled: !!slug });
  const groupsQuery = trpc.groups.list.useQuery({ productId: productQuery.data?.id }, {
    enabled: !!productQuery.data?.id,
  });

  // Also load suggested products for "Proposition de groupe"
  const allProductsQuery = trpc.products.list.useQuery({});

  const group = useMemo(() => {
    if (!groupsQuery.data?.length) return null;
    return groupsQuery.data[0];
  }, [groupsQuery.data]);

  const suggestedProducts = useMemo(() => {
    if (!allProductsQuery.data || !productQuery.data) return [];
    return allProductsQuery.data
      .filter((p: any) => p.id !== productQuery.data?.id)
      .slice(0, 3);
  }, [allProductsQuery.data, productQuery.data]);

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
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

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
            <p className="text-muted-foreground mb-3">{product.description}</p>

            {/* Share buttons — visible even without buying */}
            <div className="mb-4">
              <ShareButtons title={product.name} url={shareUrl} />
            </div>

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

        {/* ─── Proposition de groupe / Produits similaires ───── */}
        {suggestedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-tb-orange/10 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-tb-orange" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Propositions de groupes</h2>
                <p className="text-xs text-muted-foreground">D'autres produits disponibles en achat groupé</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestedProducts.map((p: any) => (
                <Link key={p.id} href={`/te-raga/${p.slug}`}>
                  <div className="tb-card hover:shadow-md transition-shadow cursor-pointer">
                    <div className="h-28 rounded-lg bg-gradient-to-br from-tb-orange/5 to-tb-green/5 flex items-center justify-center mb-3">
                      <ShoppingCart className="w-8 h-8 text-tb-green/20" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-1">{p.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-muted-foreground line-through">{formatFCFA(p.standardPrice)}</span>
                      <span className="text-sm font-bold text-tb-green">{formatFCFA(p.groupPrice)}</span>
                      <Badge variant="outline" className="text-[10px] text-tb-green border-tb-green/30">-{p.discount}%</Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />
                      <span>Groupe disponible</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ─── WhatsApp CTA ───────────────────────────────────── */}
        <div className="mt-10 rounded-2xl bg-gradient-to-r from-[#25D366]/10 to-[#25D366]/5 border border-[#25D366]/20 p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center shrink-0">
            <MessageCircle className="w-6 h-6 text-[#25D366]" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-semibold text-foreground mb-1">Rejoignez le groupe WhatsApp Te Raga</h3>
            <p className="text-sm text-muted-foreground">
              Soyez informé des nouveaux groupes d'achat, des offres exclusives et échangez avec la communauté.
            </p>
          </div>
          <a
            href="https://chat.whatsapp.com/terrabiga"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="bg-[#25D366] hover:bg-[#25D366]/90 text-white gap-2 rounded-xl h-11 px-5 shrink-0">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Rejoindre
            </Button>
          </a>
        </div>
      </div>
    </Layout>
  );
}
