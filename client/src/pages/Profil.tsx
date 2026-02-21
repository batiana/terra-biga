import Layout from "@/components/Layout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  User, Star, ShoppingCart, PiggyBank, LogOut, ArrowLeft,
  Gift, TrendingUp, Award, ChevronRight
} from "lucide-react";
import { LEVELS } from "@shared/types";
import { getLoginUrl } from "@/const";

function formatFCFA(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

export default function Profil() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const ordersQuery = trpc.orders.myOrders.useQuery(undefined, { enabled: isAuthenticated });
  const pointsQuery = trpc.points.history.useQuery(undefined, { enabled: isAuthenticated });

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
        <div className="container py-16 text-center max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-tb-green/10 flex items-center justify-center">
            <User className="w-8 h-8 text-tb-green" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Mon Profil</h1>
          <p className="text-muted-foreground mb-6">Connectez-vous pour accéder à votre profil et vos commandes</p>
          <a href={getLoginUrl()}>
            <Button className="bg-tb-green hover:bg-tb-green/90 text-white h-12 px-8 rounded-xl text-base">
              Se connecter
            </Button>
          </a>
        </div>
      </Layout>
    );
  }

  const points = (user as any)?.points ?? 0;
  const level = (user as any)?.level ?? "bronze";
  const currentLevel = LEVELS.find((l) => l.key === level) || LEVELS[0];
  const nextLevel = LEVELS[LEVELS.indexOf(currentLevel) + 1];
  const progressToNext = nextLevel
    ? Math.min(Math.round(((points - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100), 100)
    : 100;

  return (
    <Layout>
      <div className="container py-6 sm:py-10 max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Accueil
        </Link>

        {/* Profile Header */}
        <div className="tb-card mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-tb-green to-tb-blue flex items-center justify-center">
              <span className="text-white font-bold text-xl">{user?.name?.charAt(0) || "U"}</span>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{user?.name || "Utilisateur"}</h1>
              <p className="text-sm text-muted-foreground">{user?.email || ""}</p>
            </div>
          </div>
        </div>

        {/* Points Card */}
        <div className="tb-card mb-6 bg-gradient-to-r from-tb-green/5 to-tb-blue/5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold flex items-center gap-2">
              <Star className="w-5 h-5 text-tb-orange" /> Points BIGA
            </h2>
            <Badge className="bg-tb-orange/10 text-tb-orange border-0 text-sm">
              {currentLevel.icon} {currentLevel.label}
            </Badge>
          </div>
          <p className="text-3xl font-bold text-tb-green mb-2">{new Intl.NumberFormat("fr-FR").format(points)} pts</p>
          {nextLevel && (
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{currentLevel.label}</span>
                <span>{nextLevel.label} ({nextLevel.minPoints} pts)</span>
              </div>
              <Progress value={progressToNext} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Encore {nextLevel.minPoints - points} points pour atteindre {nextLevel.label}
              </p>
            </div>
          )}
        </div>

        {/* Level Benefits */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-tb-blue" /> Niveaux BIGA
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {LEVELS.map((l) => (
              <div
                key={l.key}
                className={`p-3 rounded-xl border text-center ${
                  l.key === level ? "border-tb-green bg-tb-green/5" : "border-border"
                }`}
              >
                <span className="text-2xl">{l.icon}</span>
                <p className="text-xs font-semibold mt-1">{l.label}</p>
                <p className="text-[10px] text-muted-foreground">{l.minPoints}+ pts</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders">
          <TabsList className="w-full grid grid-cols-2 h-11 mb-4">
            <TabsTrigger value="orders" className="text-sm font-semibold">Mes Commandes</TabsTrigger>
            <TabsTrigger value="points" className="text-sm font-semibold">Historique Points</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            {ordersQuery.data && ordersQuery.data.length > 0 ? (
              <div className="space-y-2">
                {ordersQuery.data.map((order) => (
                  <div key={order.id} className="tb-card flex items-center justify-between">
                    <div>
                      <p className="font-mono font-semibold text-sm text-tb-green">{order.orderCode}</p>
                      <p className="text-xs text-muted-foreground">{formatFCFA(order.totalAmount)}</p>
                    </div>
                    <Badge className={`border-0 text-xs ${
                      order.paymentStatus === "fully_paid" ? "bg-tb-green/10 text-tb-green" :
                      order.paymentStatus === "advance_paid" ? "bg-tb-orange/10 text-tb-orange" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {order.paymentStatus === "fully_paid" ? "Payé" :
                       order.paymentStatus === "advance_paid" ? "Avance payée" : "En attente"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <ShoppingCart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Aucune commande pour le moment</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="points">
            {pointsQuery.data && pointsQuery.data.length > 0 ? (
              <div className="space-y-2">
                {pointsQuery.data.map((pt, i) => (
                  <div key={i} className="tb-card flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{pt.description || pt.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(pt.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <span className={`text-sm font-bold ${pt.points > 0 ? "text-tb-green" : "text-destructive"}`}>
                      {pt.points > 0 ? "+" : ""}{pt.points} pts
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Star className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Aucun historique de points</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Logout */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => logout()}
            variant="outline"
            className="gap-2 text-destructive border-destructive/20 hover:bg-destructive/5 rounded-xl"
          >
            <LogOut className="w-4 h-4" /> Se déconnecter
          </Button>
        </div>
      </div>
    </Layout>
  );
}
