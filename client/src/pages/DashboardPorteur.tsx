/**
 * client/src/pages/DashboardPorteur.tsx
 * ─────────────────────────────────────────────────────────────────────
 * Dashboard du porteur de cagnotte.
 * Accessible depuis /ma-cagnotte/dashboard ou depuis le profil.
 *
 * Fonctionnalités :
 *  - Liste des cagnottes personnelles avec métriques rapides
 *  - Actions rapides : Pause / Reprendre / Clôturer
 *  - Publier une mise à jour (texte + photo optionnelle)
 *  - Mur des contributions reçues
 *  - Lien vers page publique de partage
 */

import Layout from "@/components/Layout";
import ShareCagnotte from "@/components/ShareCagnotte";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  PiggyBank, Plus, PauseCircle, PlayCircle, XCircle,
  Megaphone, Heart, Share2, ExternalLink, ArrowLeft,
  Clock, Users, TrendingUp, CheckCircle, AlertCircle
} from "lucide-react";
import { useState } from "react";
import { CAGNOTTE_CATEGORIES } from "@shared/types";
import { getLoginUrl } from "@/const";

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}
function timeAgo(d: Date | string): string {
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}j`;
}

// ─── Status helpers ───────────────────────────────────────────────────
const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  active:          { label: "Active",         color: "bg-green-100 text-green-700" },
  paused:          { label: "En pause",        color: "bg-yellow-100 text-yellow-700" },
  pending_review:  { label: "En révision",     color: "bg-blue-100 text-blue-700" },
  pending_payment: { label: "Paiement requis", color: "bg-orange-100 text-orange-700" },
  completed:       { label: "Clôturée",        color: "bg-gray-100 text-gray-600" },
  rejected:        { label: "Rejetée",         color: "bg-red-100 text-red-700" },
};

export default function DashboardPorteur() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  const minesQuery = trpc.cagnottes.mine.useQuery(undefined, { enabled: isAuthenticated });
  const utils = trpc.useUtils();

  const pauseMutation   = trpc.cagnottes.pause.useMutation({ onSuccess: () => utils.cagnottes.mine.invalidate() });
  const resumeMutation  = trpc.cagnottes.resume.useMutation({ onSuccess: () => utils.cagnottes.mine.invalidate() });
  const closeMutation   = trpc.cagnottes.close.useMutation({ onSuccess: () => utils.cagnottes.mine.invalidate() });

  // Selected cagnotte for detail panel
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // ── Loading / Auth ────────────────────────────────────────────────
  if (loading) {
    return (
      <Layout>
        <div className="container py-10 max-w-2xl mx-auto space-y-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container py-16 text-center max-w-sm mx-auto">
          <PiggyBank className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <h1 className="text-xl font-bold mb-2">Connectez-vous</h1>
          <p className="text-muted-foreground mb-6 text-sm">Pour gérer vos cagnottes</p>
          <a href={getLoginUrl()}>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-12 px-8">
              Se connecter
            </Button>
          </a>
        </div>
      </Layout>
    );
  }

  const cagnottes = minesQuery.data ?? [];
  const selected = cagnottes.find(c => c.id === selectedId) ?? null;

  return (
    <Layout>
      <div className="container py-6 max-w-4xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Mes cagnottes</h1>
            <p className="text-sm text-muted-foreground">{cagnottes.length} cagnotte{cagnottes.length > 1 ? "s" : ""}</p>
          </div>
          <Link href="/ma-cagnotte/creer">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl gap-2 h-10">
              <Plus className="w-4 h-4" /> Créer
            </Button>
          </Link>
        </div>

        {minesQuery.isLoading && (
          <div className="space-y-3">
            {[1,2].map(i => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
          </div>
        )}

        {!minesQuery.isLoading && cagnottes.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
            <PiggyBank className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">Vous n'avez pas encore de cagnotte</p>
            <Link href="/ma-cagnotte/creer">
              <Button variant="outline" className="gap-2">
                <Plus className="w-4 h-4" /> Créer ma première cagnotte
              </Button>
            </Link>
          </div>
        )}

        <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-6">
          {/* ── Cagnotte list ── */}
          <div className="space-y-3 mb-6 lg:mb-0">
            {cagnottes.map(cagnotte => {
              const catInfo = CAGNOTTE_CATEGORIES.find(c => c.key === cagnotte.category);
              const percent = cagnotte.targetAmount
                ? Math.min(Math.round((cagnotte.currentAmount / cagnotte.targetAmount) * 100), 100)
                : null;
              const statusInfo = STATUS_LABEL[cagnotte.status] ?? STATUS_LABEL.active;
              const isSelected = selectedId === cagnotte.id;

              return (
                <div
                  key={cagnotte.id}
                  className={`bg-white border rounded-2xl p-4 transition cursor-pointer ${
                    isSelected ? "border-orange-400 ring-2 ring-orange-100" : "border-gray-100 hover:border-orange-200"
                  }`}
                  onClick={() => setSelectedId(isSelected ? null : cagnotte.id)}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl shrink-0">{catInfo?.icon ?? "🙏"}</span>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">{cagnotte.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>
                    {/* Quick action buttons */}
                    <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                      {cagnotte.status === "active" && (
                        <button
                          onClick={() => pauseMutation.mutate({ id: cagnotte.id })}
                          disabled={pauseMutation.isPending}
                          className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-600 transition"
                          title="Mettre en pause"
                        >
                          <PauseCircle className="w-4 h-4" />
                        </button>
                      )}
                      {cagnotte.status === "paused" && (
                        <button
                          onClick={() => resumeMutation.mutate({ id: cagnotte.id })}
                          disabled={resumeMutation.isPending}
                          className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition"
                          title="Reprendre"
                        >
                          <PlayCircle className="w-4 h-4" />
                        </button>
                      )}
                      {(cagnotte.status === "active" || cagnotte.status === "paused") && (
                        <ConfirmClose
                          onConfirm={() => closeMutation.mutate({ id: cagnotte.id })}
                          isPending={closeMutation.isPending}
                        />
                      )}
                      {cagnotte.slug && (
                        <Link href={`/c/${cagnotte.slug}`} onClick={e => e.stopPropagation()}>
                          <button className="p-1.5 rounded-lg hover:bg-orange-50 text-orange-500 transition" title="Voir la page publique">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-1.5">
                    {percent !== null && (
                      <Progress value={percent} className="h-1.5 rounded-full" />
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-semibold text-green-600">{fmt(cagnotte.currentAmount)}</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {cagnotte.contributorsCount}
                        {cagnotte.targetAmount && (
                          <span className="ml-2">{percent}%</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Detail panel ── */}
          {selected && (
            <CagnotteDetailPanel
              cagnotte={selected}
              onClose={() => setSelectedId(null)}
            />
          )}

          {!selected && (
            <div className="hidden lg:flex items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl text-muted-foreground text-sm">
              Sélectionnez une cagnotte pour la gérer
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

// ─── Detail panel ─────────────────────────────────────────────────────

function CagnotteDetailPanel({ cagnotte, onClose }: { cagnotte: any; onClose: () => void }) {
  const utils = trpc.useUtils();
  const contributionsQuery = trpc.cagnottes.contributions.useQuery({ cagnotteId: cagnotte.id });
  const updatesQuery = trpc.cagnottes.updates.useQuery({ cagnotteId: cagnotte.id });
  const publishMutation = trpc.cagnottes.publishUpdate.useMutation({
    onSuccess: () => {
      utils.cagnottes.updates.invalidate({ cagnotteId: cagnotte.id });
      setUpdateContent("");
      setUpdateImage("");
    }
  });

  const [updateContent, setUpdateContent] = useState("");
  const [updateImage, setUpdateImage] = useState("");

  const contributions = contributionsQuery.data ?? [];
  const updates = updatesQuery.data ?? [];

  const percent = cagnotte.targetAmount
    ? Math.min(Math.round((cagnotte.currentAmount / cagnotte.targetAmount) * 100), 100)
    : null;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 h-fit">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-800 truncate pr-2">{cagnotte.title}</h2>
        <button onClick={onClose} className="text-muted-foreground hover:text-gray-600 shrink-0 lg:hidden">
          <XCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="text-center p-3 bg-green-50 rounded-xl">
          <p className="text-lg font-bold text-green-600">{fmt(cagnotte.currentAmount).replace(" FCFA", "")}</p>
          <p className="text-xs text-muted-foreground">Collecté</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-xl">
          <p className="text-lg font-bold text-blue-600">{cagnotte.contributorsCount}</p>
          <p className="text-xs text-muted-foreground">Contributeurs</p>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-xl">
          <p className="text-lg font-bold text-orange-500">{percent !== null ? `${percent}%` : "∞"}</p>
          <p className="text-xs text-muted-foreground">Progression</p>
        </div>
      </div>

      {percent !== null && (
        <Progress value={percent} className="h-2 rounded-full mb-5" />
      )}

      <Tabs defaultValue="update">
        <TabsList className="w-full mb-4 rounded-xl">
          <TabsTrigger value="update" className="flex-1 text-xs">Mise à jour</TabsTrigger>
          <TabsTrigger value="contributions" className="flex-1 text-xs">Contributions ({contributions.length})</TabsTrigger>
          <TabsTrigger value="share" className="flex-1 text-xs">Partager</TabsTrigger>
        </TabsList>

        {/* Tab: Publier une mise à jour */}
        <TabsContent value="update" className="space-y-3">
          <Textarea
            value={updateContent}
            onChange={e => setUpdateContent(e.target.value)}
            placeholder="Partagez une actualité avec vos contributeurs... comment avance votre projet ?"
            rows={4}
            className="rounded-xl text-sm resize-none"
            maxLength={2000}
          />
          <Input
            value={updateImage}
            onChange={e => setUpdateImage(e.target.value)}
            placeholder="URL d'une image (optionnel)"
            className="h-10 rounded-xl text-sm"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{updateContent.length}/2000</span>
            <Button
              onClick={() => publishMutation.mutate({
                cagnotteId: cagnotte.id,
                content: updateContent,
                imageUrl: updateImage || undefined,
              })}
              disabled={publishMutation.isPending || updateContent.length < 10}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-9 text-sm gap-1.5"
            >
              <Megaphone className="w-3.5 h-3.5" />
              {publishMutation.isPending ? "Publication..." : "Publier"}
            </Button>
          </div>

          {/* Previous updates */}
          {updates.length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-medium text-muted-foreground mb-2">Mises à jour publiées</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {updates.map((u: any, i: number) => (
                  <div key={i} className="text-xs bg-orange-50/50 rounded-xl p-2.5">
                    <p className="text-gray-700 line-clamp-2">{u.content}</p>
                    <p className="text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {timeAgo(u.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Tab: Contributions */}
        <TabsContent value="contributions">
          {contributions.length === 0 ? (
            <div className="text-center py-6">
              <Heart className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Aucune contribution pour le moment</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {contributions.map((c: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50">
                  <div>
                    <p className="text-sm font-medium">
                      {c.isAnonymous ? "Anonyme" : c.contributorName || "Contributeur"}
                    </p>
                    {c.message && (
                      <p className="text-xs text-muted-foreground italic line-clamp-1">"{c.message}"</p>
                    )}
                    <p className="text-xs text-muted-foreground">{timeAgo(c.createdAt)}</p>
                  </div>
                  <span className="text-sm font-bold text-green-600 shrink-0">{fmt(c.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab: Partager */}
        <TabsContent value="share" className="space-y-3">
          {cagnotte.slug && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-muted-foreground mb-1">Lien public</p>
              <p className="text-sm font-mono text-orange-600 break-all">
                terrabiga.com/c/{cagnotte.slug}
              </p>
            </div>
          )}
          <ShareCagnotte cagnotte={cagnotte} variant="button" className="w-full" />
          {cagnotte.slug && (
            <Link href={`/c/${cagnotte.slug}`}>
              <Button variant="outline" className="w-full gap-2 rounded-xl h-10 text-sm">
                <ExternalLink className="w-4 h-4" /> Voir la page publique
              </Button>
            </Link>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Confirm close dialog ─────────────────────────────────────────────

function ConfirmClose({ onConfirm, isPending }: { onConfirm: () => void; isPending: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
        title="Clôturer la cagnotte"
      >
        <XCircle className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-48">
          <p className="text-xs text-gray-700 mb-2">Clôturer cette cagnotte ?</p>
          <div className="flex gap-2">
            <Button
              onClick={() => { onConfirm(); setOpen(false); }}
              disabled={isPending}
              className="flex-1 h-7 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg"
            >
              Confirmer
            </Button>
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
              className="flex-1 h-7 text-xs rounded-lg"
            >
              Non
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
