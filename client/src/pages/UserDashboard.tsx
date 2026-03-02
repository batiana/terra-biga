import Layout from "@/components/Layout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

export default function UserDashboard() {
  const { isAuthenticated, loading, user } = useAuth();

  const pointsQuery = trpc.points.history.useQuery(undefined, { enabled: isAuthenticated });
  const ordersQuery = trpc.orders.myOrders.useQuery(undefined, { enabled: isAuthenticated });
  const cagnottesQuery = trpc.cagnottes.mine.useQuery(undefined, { enabled: isAuthenticated });
  const contributionsQuery = trpc.contributions.mine.useQuery(undefined, { enabled: isAuthenticated });

  if (loading) {
    return (
      <Layout>
        <div className="container py-10">Chargement...</div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container py-10">
          <p className="mb-4">Connectez-vous pour accéder à votre dashboard.</p>
          <Link href="/connexion">
            <Button>Se connecter</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const recentPoints = pointsQuery.data?.slice(0, 5) ?? [];
  const recentOrders = ordersQuery.data?.slice(0, 5) ?? [];
  const recentCagnottes = cagnottesQuery.data?.slice(0, 5) ?? [];
  const recentContributions = contributionsQuery.data?.slice(0, 5) ?? [];

  return (
    <Layout>
      <div className="container py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Bienvenue {user?.name || ""}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs text-muted-foreground">Points BIGA</p>
            <p className="text-xl font-bold">{user?.points ?? 0}</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs text-muted-foreground">Cagnottes</p>
            <p className="text-xl font-bold">{cagnottesQuery.data?.length ?? 0}</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs text-muted-foreground">Commandes</p>
            <p className="text-xl font-bold">{ordersQuery.data?.length ?? 0}</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs text-muted-foreground">Contributions</p>
            <p className="text-xl font-bold">{contributionsQuery.data?.length ?? 0}</p>
          </div>
        </div>

        <section className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold mb-3">Activité récente</h2>
          {recentPoints.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune activité</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {recentPoints.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span>{item.action}</span>
                  <span className="font-medium">{item.points > 0 ? `+${item.points}` : item.points}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="grid md:grid-cols-2 gap-4">
          <section className="rounded-xl border bg-white p-4">
            <h2 className="font-semibold mb-3">Mes commandes</h2>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune commande</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {recentOrders.map((order) => (
                  <li key={order.id} className="flex justify-between">
                    <span>{order.orderCode}</span>
                    <span>{fmt(order.totalAmount)}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/dashboard/commandes" className="mt-3 inline-block text-orange-600 text-sm">
              Voir tout
            </Link>
          </section>

          <section className="rounded-xl border bg-white p-4">
            <h2 className="font-semibold mb-3">Mes cagnottes</h2>
            {recentCagnottes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune cagnotte</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {recentCagnottes.map((cagnotte) => (
                  <li key={cagnotte.id} className="flex justify-between">
                    <span>{cagnotte.title}</span>
                    <span>{fmt(cagnotte.currentAmount)}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/dashboard/cagnottes" className="mt-3 inline-block text-orange-600 text-sm">
              Voir tout
            </Link>
          </section>
        </div>

        <section className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold mb-3">Mes contributions</h2>
          {recentContributions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune contribution</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {recentContributions.map((contribution) => (
                <li key={contribution.id} className="flex justify-between">
                  <span>{contribution.contributorName || "Anonyme"}</span>
                  <span>{fmt(contribution.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Layout>
  );
}
