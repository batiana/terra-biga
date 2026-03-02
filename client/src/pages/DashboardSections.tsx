import Layout from "@/components/Layout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

function Guard({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

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
          <p className="mb-4">Connexion requise.</p>
          <Link href="/connexion">
            <Button>Se connecter</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return <>{children}</>;
}

export function DashboardProfilPage() {
  const { user } = useAuth();
  const pointsQuery = trpc.points.history.useQuery();

  return (
    <Guard>
      <Layout>
        <div className="container py-8 space-y-4">
          <h1 className="text-2xl font-bold">Mon profil</h1>
          <div className="rounded-xl border bg-white p-4 space-y-2 text-sm">
            <p><span className="font-medium">Nom:</span> {user?.name || "-"}</p>
            <p><span className="font-medium">Téléphone:</span> {user?.phone || "-"}</p>
            <p><span className="font-medium">Email:</span> {user?.email || "-"}</p>
            <p><span className="font-medium">Points BIGA:</span> {user?.points ?? 0}</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <h2 className="font-semibold mb-2">Historique points</h2>
            <ul className="space-y-1 text-sm">
              {(pointsQuery.data ?? []).slice(0, 20).map((point) => (
                <li key={point.id} className="flex justify-between">
                  <span>{point.action}</span>
                  <span>{point.points > 0 ? `+${point.points}` : point.points}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Layout>
    </Guard>
  );
}

export function DashboardCagnottesPage() {
  const cagnottesQuery = trpc.cagnottes.mine.useQuery();

  return (
    <Guard>
      <Layout>
        <div className="container py-8">
          <h1 className="text-2xl font-bold mb-4">Mes cagnottes</h1>
          <div className="space-y-2">
            {(cagnottesQuery.data ?? []).map((cagnotte) => (
              <Link key={cagnotte.id} href={`/dashboard/cagnottes/${cagnotte.id}`}>
                <div className="rounded-xl border bg-white p-4 hover:border-orange-300 transition">
                  <p className="font-medium">{cagnotte.title}</p>
                  <p className="text-sm text-muted-foreground">{fmt(cagnotte.currentAmount)} collectés</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Layout>
    </Guard>
  );
}

export function DashboardCagnotteDetailPage() {
  const [, params] = useRoute("/dashboard/cagnottes/:id");
  const id = Number(params?.id ?? "0");
  const cagnotteQuery = trpc.cagnottes.byId.useQuery({ id }, { enabled: id > 0 });
  const contributionsQuery = trpc.cagnottes.contributions.useQuery({ cagnotteId: id }, { enabled: id > 0 });

  return (
    <Guard>
      <Layout>
        <div className="container py-8 space-y-4">
          <h1 className="text-2xl font-bold">Détail cagnotte</h1>
          {cagnotteQuery.data && (
            <div className="rounded-xl border bg-white p-4">
              <p className="font-semibold">{cagnotteQuery.data.title}</p>
              <p className="text-sm text-muted-foreground">{fmt(cagnotteQuery.data.currentAmount)} collectés</p>
            </div>
          )}
          <div className="rounded-xl border bg-white p-4">
            <h2 className="font-semibold mb-2">Contributions</h2>
            <ul className="space-y-1 text-sm">
              {(contributionsQuery.data ?? []).map((contribution) => (
                <li key={contribution.id} className="flex justify-between">
                  <span>{contribution.contributorName || "Anonyme"}</span>
                  <span>{fmt(contribution.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Layout>
    </Guard>
  );
}

export function DashboardContributionsPage() {
  const contributionsQuery = trpc.contributions.mine.useQuery();

  return (
    <Guard>
      <Layout>
        <div className="container py-8">
          <h1 className="text-2xl font-bold mb-4">Mes contributions</h1>
          <div className="space-y-2">
            {(contributionsQuery.data ?? []).map((contribution) => (
              <div key={contribution.id} className="rounded-xl border bg-white p-4 flex justify-between text-sm">
                <span>{contribution.contributorName || "Anonyme"}</span>
                <span>{fmt(contribution.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    </Guard>
  );
}

export function DashboardCommandesPage() {
  const ordersQuery = trpc.orders.myOrders.useQuery();

  return (
    <Guard>
      <Layout>
        <div className="container py-8">
          <h1 className="text-2xl font-bold mb-4">Mes commandes</h1>
          <div className="space-y-2">
            {(ordersQuery.data ?? []).map((order) => (
              <Link key={order.id} href={`/dashboard/commandes/${order.id}`}>
                <div className="rounded-xl border bg-white p-4 hover:border-orange-300 transition">
                  <p className="font-medium">{order.orderCode}</p>
                  <p className="text-sm text-muted-foreground">{fmt(order.totalAmount)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Layout>
    </Guard>
  );
}

export function DashboardCommandeDetailPage() {
  const [, params] = useRoute("/dashboard/commandes/:id");
  const id = Number(params?.id ?? "0");
  const orderQuery = trpc.orders.byId.useQuery({ id }, { enabled: id > 0 });

  return (
    <Guard>
      <Layout>
        <div className="container py-8 space-y-4">
          <h1 className="text-2xl font-bold">Détail commande</h1>
          {orderQuery.data && (
            <div className="rounded-xl border bg-white p-4 text-sm space-y-1">
              <p><span className="font-medium">Code:</span> {orderQuery.data.orderCode}</p>
              <p><span className="font-medium">Total:</span> {fmt(orderQuery.data.totalAmount)}</p>
              <p><span className="font-medium">Statut paiement:</span> {orderQuery.data.paymentStatus}</p>
              <p><span className="font-medium">Statut collecte:</span> {orderQuery.data.collectionStatus}</p>
            </div>
          )}
        </div>
      </Layout>
    </Guard>
  );
}

export function DashboardPropositionsPage() {
  const proposalsQuery = trpc.proposals.mine.useQuery();

  return (
    <Guard>
      <Layout>
        <div className="container py-8">
          <h1 className="text-2xl font-bold mb-4">Mes propositions</h1>
          <div className="space-y-2">
            {(proposalsQuery.data ?? []).map((proposal) => (
              <div key={proposal.id} className="rounded-xl border bg-white p-4 text-sm">
                <p className="font-medium">{proposal.title}</p>
                <p className="text-muted-foreground">Votes: {proposal.votes}</p>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    </Guard>
  );
}
