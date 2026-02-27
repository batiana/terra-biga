import Layout from "@/components/Layout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart3, ShoppingCart, PiggyBank, Users, CreditCard,
  Shield, ArrowLeft, CheckCircle, XCircle, Eye, FileText,
  Heart, TrendingUp, AlertTriangle
} from "lucide-react";
import { useState } from "react";
import { getLoginUrl } from "@/const";

function formatFCFA(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <div className="w-10 h-10 mx-auto border-4 border-tb-green/30 border-t-tb-green rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">Connectez-vous pour accéder à l'administration</p>
          <a href={getLoginUrl()}>
            <Button className="bg-tb-green hover:bg-tb-green/90 text-white rounded-xl">Se connecter</Button>
          </a>
        </div>
      </Layout>
    );
  }

  if (user?.role !== "admin") {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <Shield className="w-12 h-12 text-destructive/30 mx-auto mb-3" />
          <h2 className="text-xl font-bold mb-2">Accès refusé</h2>
          <p className="text-muted-foreground">Vous n'avez pas les droits d'administration.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6 sm:py-10">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Administration</h1>
            <p className="text-sm text-muted-foreground">Panneau de gestion Terra Biga</p>
          </div>
        </div>

        <AdminDashboard />
      </div>
    </Layout>
  );
}

function AdminDashboard() {
  const statsQuery = trpc.admin.stats.useQuery();

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {statsQuery.isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="tb-card"><Skeleton className="h-12" /></div>
          ))
        ) : (
          <>
            <StatCard icon={<Users className="w-5 h-5 text-tb-blue" />} label="Utilisateurs" value={String(statsQuery.data?.users ?? 0)} />
            <StatCard icon={<ShoppingCart className="w-5 h-5 text-tb-green" />} label="Commandes" value={String(statsQuery.data?.orders ?? 0)} />
            <StatCard icon={<PiggyBank className="w-5 h-5 text-tb-blue" />} label="Cagnottes" value={String(statsQuery.data?.cagnottes ?? 0)} />
            <StatCard icon={<Heart className="w-5 h-5 text-tb-orange" />} label="Dons" value={formatFCFA(statsQuery.data?.donations ?? 0)} />
            <StatCard icon={<TrendingUp className="w-5 h-5 text-tb-green" />} label="Revenus" value={formatFCFA(statsQuery.data?.revenue ?? 0)} />
          </>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="orders">
        <TabsList className="w-full grid grid-cols-3 sm:grid-cols-6 h-11 mb-4">
          <TabsTrigger value="orders" className="text-xs sm:text-sm">Commandes</TabsTrigger>
          <TabsTrigger value="cagnottes" className="text-xs sm:text-sm">Cagnottes</TabsTrigger>
          <TabsTrigger value="identities" className="text-xs sm:text-sm">Identités</TabsTrigger>
          <TabsTrigger value="payments" className="text-xs sm:text-sm">Paiements</TabsTrigger>
          <TabsTrigger value="users" className="text-xs sm:text-sm">Utilisateurs</TabsTrigger>
          <TabsTrigger value="donations" className="text-xs sm:text-sm">Dons</TabsTrigger>
        </TabsList>

        <TabsContent value="orders"><OrdersTab /></TabsContent>
        <TabsContent value="cagnottes"><CagnottesTab /></TabsContent>
        <TabsContent value="identities"><IdentitiesTab /></TabsContent>
        <TabsContent value="payments"><PaymentsTab /></TabsContent>
        <TabsContent value="users"><UsersTab /></TabsContent>
        <TabsContent value="donations"><DonationsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="tb-card">
      <div className="flex items-center gap-2 mb-1">{icon}<span className="text-xs text-muted-foreground">{label}</span></div>
      <p className="text-lg font-bold text-foreground truncate">{value}</p>
    </div>
  );
}

function OrdersTab() {
  const ordersQuery = trpc.admin.orders.useQuery({});
  const updateMutation = trpc.admin.updateOrderStatus.useMutation();
  const utils = trpc.useUtils();

  if (ordersQuery.isLoading) return <Skeleton className="h-40" />;

  return (
    <div className="space-y-2">
      {ordersQuery.data?.length === 0 && <p className="text-center text-muted-foreground py-8">Aucune commande</p>}
      {ordersQuery.data?.map((order) => (
        <div key={order.id} className="tb-card">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div>
              <span className="font-mono font-bold text-sm text-tb-green">{order.orderCode}</span>
              <span className="text-xs text-muted-foreground ml-2">{order.customerPhone}</span>
            </div>
            <span className="text-sm font-semibold">{formatFCFA(order.totalAmount)}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className={`border-0 text-xs ${
              order.paymentStatus === "fully_paid" ? "bg-tb-green/10 text-tb-green" :
              order.paymentStatus === "advance_paid" ? "bg-tb-orange/10 text-tb-orange" :
              "bg-muted text-muted-foreground"
            }`}>
              {order.paymentStatus === "fully_paid" ? "Payé" :
               order.paymentStatus === "advance_paid" ? "Avance payée" : "En attente"}
            </Badge>
            <Badge className={`border-0 text-xs ${
              order.collectionStatus === "collected" ? "bg-tb-green/10 text-tb-green" :
              order.collectionStatus === "ready" ? "bg-tb-blue/10 text-tb-blue" :
              "bg-muted text-muted-foreground"
            }`}>
              {order.collectionStatus === "collected" ? "Collecté" :
               order.collectionStatus === "ready" ? "Prêt" : "En attente"}
            </Badge>
            <Select
              value={order.collectionStatus ?? "waiting"}
              onValueChange={async (val) => {
                await updateMutation.mutateAsync({ orderId: order.id, collectionStatus: val as any });
                utils.admin.orders.invalidate();
              }}
            >
              <SelectTrigger className="h-7 w-28 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="waiting">En attente</SelectItem>
                <SelectItem value="ready">Prêt</SelectItem>
                <SelectItem value="collected">Collecté</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ))}
    </div>
  );
}

function CagnottesTab() {
  const cagnottesQuery = trpc.admin.cagnottes.useQuery({});
  const approveMutation = trpc.admin.approveCagnotte.useMutation();
  const rejectMutation = trpc.admin.rejectCagnotte.useMutation();
  const utils = trpc.useUtils();

  if (cagnottesQuery.isLoading) return <Skeleton className="h-40" />;

  return (
    <div className="space-y-2">
      {cagnottesQuery.data?.length === 0 && <p className="text-center text-muted-foreground py-8">Aucune cagnotte</p>}
      {cagnottesQuery.data?.map((c) => (
        <div key={c.id} className="tb-card">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h4 className="font-semibold text-sm">{c.title}</h4>
              <p className="text-xs text-muted-foreground">{c.category} &middot; {c.creatorName || "Anonyme"}</p>
            </div>
            <Badge className={`border-0 text-xs shrink-0 ${
              c.status === "active" ? "bg-tb-green/10 text-tb-green" :
              c.status === "pending_review" ? "bg-tb-orange/10 text-tb-orange" :
              c.status === "rejected" ? "bg-destructive/10 text-destructive" :
              "bg-muted text-muted-foreground"
            }`}>
              {c.status === "active" ? "Active" :
               c.status === "pending_review" ? "En attente" :
               c.status === "rejected" ? "Rejetée" : c.status}
            </Badge>
          </div>
          <div className="text-sm mb-2">
            <span className="text-tb-green font-semibold">{formatFCFA(c.currentAmount)}</span>
            <span className="text-muted-foreground"> / {c.targetAmount ? formatFCFA(c.targetAmount) : "Pas d'objectif"}</span>
          </div>
          {c.status === "pending_review" && (
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-tb-green hover:bg-tb-green/90 text-white gap-1 h-8 text-xs rounded-lg"
                onClick={async () => {
                  await approveMutation.mutateAsync({ cagnotteId: c.id });
                  utils.admin.cagnottes.invalidate();
                }}
              >
                <CheckCircle className="w-3 h-3" /> Approuver
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive border-destructive/20 gap-1 h-8 text-xs rounded-lg"
                onClick={async () => {
                  await rejectMutation.mutateAsync({ cagnotteId: c.id, reason: "Non conforme" });
                  utils.admin.cagnottes.invalidate();
                }}
              >
                <XCircle className="w-3 h-3" /> Rejeter
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function IdentitiesTab() {
  const identitiesQuery = trpc.admin.identities.useQuery({});
  const verifyMutation = trpc.admin.verifyIdentity.useMutation();
  const utils = trpc.useUtils();

  if (identitiesQuery.isLoading) return <Skeleton className="h-40" />;

  return (
    <div className="space-y-2">
      {identitiesQuery.data?.length === 0 && <p className="text-center text-muted-foreground py-8">Aucune identité</p>}
      {identitiesQuery.data?.map((id) => (
        <div key={id.id} className="tb-card">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h4 className="font-semibold text-sm">{id.fullName} {id.firstName || ""}</h4>
              <p className="text-xs text-muted-foreground">{id.documentType.toUpperCase()} &middot; {id.documentNumber}</p>
            </div>
            <Badge className={`border-0 text-xs ${
              id.status === "verified" ? "bg-tb-green/10 text-tb-green" :
              id.status === "rejected" ? "bg-destructive/10 text-destructive" :
              "bg-tb-orange/10 text-tb-orange"
            }`}>
              {id.status === "verified" ? "Vérifié" :
               id.status === "rejected" ? "Rejeté" : "En attente"}
            </Badge>
          </div>
          {id.status === "pending" && (
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-tb-green hover:bg-tb-green/90 text-white gap-1 h-8 text-xs rounded-lg"
                onClick={async () => {
                  await verifyMutation.mutateAsync({ identityId: id.id, status: "verified" });
                  utils.admin.identities.invalidate();
                }}
              >
                <CheckCircle className="w-3 h-3" /> Vérifier
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive border-destructive/20 gap-1 h-8 text-xs rounded-lg"
                onClick={async () => {
                  await verifyMutation.mutateAsync({ identityId: id.id, status: "rejected" });
                  utils.admin.identities.invalidate();
                }}
              >
                <XCircle className="w-3 h-3" /> Rejeter
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function PaymentsTab() {
  const paymentsQuery = trpc.admin.payments.useQuery({});

  if (paymentsQuery.isLoading) return <Skeleton className="h-40" />;

  return (
    <div className="space-y-2">
      {paymentsQuery.data?.length === 0 && <p className="text-center text-muted-foreground py-8">Aucun paiement</p>}
      {paymentsQuery.data?.map((p) => (
        <div key={p.id} className="tb-card flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{p.type} &middot; {p.method}</p>
            <p className="text-xs text-muted-foreground">{p.phone || "—"}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">{formatFCFA(p.amount)}</p>
            <Badge className={`border-0 text-xs ${
              p.status === "completed" ? "bg-tb-green/10 text-tb-green" :
              p.status === "failed" ? "bg-destructive/10 text-destructive" :
              "bg-tb-orange/10 text-tb-orange"
            }`}>
              {p.status === "completed" ? "Complété" :
               p.status === "failed" ? "Échoué" : "En attente"}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

function UsersTab() {
  const usersQuery = trpc.admin.users.useQuery({});

  if (usersQuery.isLoading) return <Skeleton className="h-40" />;

  return (
    <div className="space-y-2">
      {usersQuery.data?.length === 0 && <p className="text-center text-muted-foreground py-8">Aucun utilisateur</p>}
      {usersQuery.data?.map((u) => (
        <div key={u.id} className="tb-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-tb-green/10 flex items-center justify-center">
              <span className="text-tb-green font-bold text-sm">{(u.name || "U").charAt(0)}</span>
            </div>
            <div>
              <p className="text-sm font-medium">{u.name || "Sans nom"}</p>
              <p className="text-xs text-muted-foreground">{u.email || u.phone || "—"}</p>
            </div>
          </div>
          <div className="text-right">
            <Badge className={`border-0 text-xs ${u.role === "admin" ? "bg-tb-orange/10 text-tb-orange" : "bg-muted text-muted-foreground"}`}>
              {u.role}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

function DonationsTab() {
  const donationsQuery = trpc.admin.donations.useQuery({});

  if (donationsQuery.isLoading) return <Skeleton className="h-40" />;

  return (
    <div className="space-y-2">
      {donationsQuery.data?.length === 0 && <p className="text-center text-muted-foreground py-8">Aucun don</p>}
      {donationsQuery.data?.map((d) => (
        <div key={d.id} className="tb-card flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{d.donorName || "Anonyme"}</p>
            <p className="text-xs text-muted-foreground">{d.donorPhone || "—"}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-tb-green">{formatFCFA(d.amount)}</p>
            <Badge className={`border-0 text-xs ${
              d.paymentStatus === "completed" ? "bg-tb-green/10 text-tb-green" : "bg-tb-orange/10 text-tb-orange"
            }`}>
              {d.paymentStatus === "completed" ? "Complété" : "En attente"}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
