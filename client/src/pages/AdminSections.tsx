import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { Link, useRoute } from "wouter";
import type { ReactNode } from "react";

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        {children}
      </div>
    </Layout>
  );
}

export function AdminProductsPage() {
  const productsQuery = trpc.products.list.useQuery();
  return (
    <Section title="Admin / Te Raga / Produits">
      <div className="space-y-2">
        {(productsQuery.data ?? []).map((product) => (
          <div key={product.id} className="rounded-xl border bg-white p-4 text-sm">
            <p className="font-medium">{product.name}</p>
            <p className="text-muted-foreground">{fmt(product.groupPrice)}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function AdminGroupsPage() {
  const groupsQuery = trpc.groups.list.useQuery();
  return (
    <Section title="Admin / Te Raga / Groupes">
      <div className="space-y-2">
        {(groupsQuery.data ?? []).map((group) => (
          <div key={group.id} className="rounded-xl border bg-white p-4 text-sm">
            <p>Groupe #{group.id}</p>
            <p className="text-muted-foreground">{group.currentMembers}/{group.maxMembers} - {group.status}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function AdminOrdersPage() {
  const ordersQuery = trpc.admin.orders.useQuery({});
  return (
    <Section title="Admin / Te Raga / Commandes">
      <div className="space-y-2">
        {(ordersQuery.data ?? []).map((order) => (
          <div key={order.id} className="rounded-xl border bg-white p-4 text-sm">
            <p className="font-medium">{order.orderCode}</p>
            <p className="text-muted-foreground">{order.paymentStatus} - {order.collectionStatus}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function AdminProposalsPage() {
  const productsQuery = trpc.products.list.useQuery();
  return (
    <Section title="Admin / Te Raga / Propositions">
      <div className="space-y-4">
        {(productsQuery.data ?? []).map((product) => (
          <ProductProposals key={product.id} productId={product.id} productName={product.name} />
        ))}
      </div>
    </Section>
  );
}

function ProductProposals({ productId, productName }: { productId: number; productName: string }) {
  const proposalsQuery = trpc.proposals.byProduct.useQuery({ productId });
  if ((proposalsQuery.data ?? []).length === 0) return null;

  return (
    <div className="rounded-xl border bg-white p-4">
      <p className="font-medium mb-2">{productName}</p>
      <div className="space-y-1 text-sm">
        {(proposalsQuery.data ?? []).map((proposal) => (
          <div key={proposal.id} className="flex justify-between">
            <span>{proposal.title}</span>
            <span>Votes: {proposal.votes}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminOrganizationsPage() {
  const organizationsQuery = trpc.organizations.list.useQuery({});
  return (
    <Section title="Admin / Organisations">
      <div className="space-y-2">
        {(organizationsQuery.data ?? []).map((organization) => (
          <div key={organization.id} className="rounded-xl border bg-white p-4 text-sm">
            <p className="font-medium">{organization.name}</p>
            <p className="text-muted-foreground">{organization.status}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function AdminProjectsPage() {
  const projectsQuery = trpc.admin.projects.useQuery({});
  return (
    <Section title="Admin / Projets">
      <div className="space-y-2">
        {(projectsQuery.data ?? []).map((project) => (
          <Link key={project.id} href={`/admin/projets/${project.id}`}>
            <div className="rounded-xl border bg-white p-4 text-sm hover:border-orange-300 transition">
              <p className="font-medium">{project.title}</p>
              <p className="text-muted-foreground">{project.status}</p>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}

export function AdminReportsPage() {
  const statsQuery = trpc.admin.stats.useQuery();
  return (
    <Section title="Admin / Rapports">
      <div className="rounded-xl border bg-white p-4 text-sm space-y-1">
        <p>Utilisateurs: {statsQuery.data?.users ?? 0}</p>
        <p>Commandes: {statsQuery.data?.orders ?? 0}</p>
        <p>Cagnottes: {statsQuery.data?.cagnottes ?? 0}</p>
        <p>Dons: {fmt(statsQuery.data?.donations ?? 0)}</p>
      </div>
    </Section>
  );
}

export function AdminBigaPage() {
  const usersQuery = trpc.admin.users.useQuery({});
  return (
    <Section title="Admin / BIGA">
      <div className="space-y-2">
        {(usersQuery.data ?? []).map((user) => (
          <div key={user.id} className="rounded-xl border bg-white p-4 text-sm flex justify-between">
            <span>{user.name || user.openId}</span>
            <span>{user.points} pts</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function AdminUsersPage() {
  const usersQuery = trpc.admin.users.useQuery({});
  return (
    <Section title="Admin / Utilisateurs">
      <div className="space-y-2">
        {(usersQuery.data ?? []).map((user) => (
          <div key={user.id} className="rounded-xl border bg-white p-4 text-sm">
            <p className="font-medium">{user.name || "Sans nom"}</p>
            <p className="text-muted-foreground">{user.phone} - {user.role}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function AdminPaymentsPage() {
  const paymentsQuery = trpc.admin.payments.useQuery({});
  return (
    <Section title="Admin / Paiements">
      <div className="space-y-2">
        {(paymentsQuery.data ?? []).map((payment) => (
          <div key={payment.id} className="rounded-xl border bg-white p-4 text-sm flex justify-between">
            <span>{payment.type} - {payment.status}</span>
            <span>{fmt(payment.amount)}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function AdminCagnotteDetailPage() {
  const [, params] = useRoute("/admin/cagnottes/:id");
  const id = Number(params?.id ?? "0");
  const cagnotteQuery = trpc.cagnottes.byId.useQuery({ id }, { enabled: id > 0 });
  const contributionsQuery = trpc.cagnottes.contributions.useQuery({ cagnotteId: id }, { enabled: id > 0 });

  return (
    <Section title="Admin / Détail cagnotte">
      {cagnotteQuery.data && (
        <div className="rounded-xl border bg-white p-4 mb-3 text-sm">
          <p className="font-medium">{cagnotteQuery.data.title}</p>
          <p className="text-muted-foreground">{cagnotteQuery.data.status}</p>
        </div>
      )}
      <div className="rounded-xl border bg-white p-4 text-sm">
        <p className="font-medium mb-2">Contributions</p>
        <ul className="space-y-1">
          {(contributionsQuery.data ?? []).map((contribution) => (
            <li key={contribution.id} className="flex justify-between">
              <span>{contribution.contributorName || "Anonyme"}</span>
              <span>{fmt(contribution.amount)}</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

export function AdminProjectDetailPage() {
  const [, params] = useRoute("/admin/projets/:id");
  const id = Number(params?.id ?? "0");
  const projectQuery = trpc.admin.projectById.useQuery({ projectId: id }, { enabled: id > 0 });
  const approveMutation = trpc.admin.approveProject.useMutation();
  const rejectMutation = trpc.admin.rejectProject.useMutation();

  return (
    <Section title="Admin / Détail projet">
      {projectQuery.data && (
        <div className="rounded-xl border bg-white p-4 text-sm space-y-2">
          <p className="font-medium">{projectQuery.data.title}</p>
          <p className="text-muted-foreground">{projectQuery.data.status}</p>
          <p>{projectQuery.data.description || "-"}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => approveMutation.mutate({ projectId: id })}
              className="rounded-lg bg-green-600 px-3 py-2 text-white"
              disabled={approveMutation.isPending}
            >
              Approuver
            </button>
            <button
              type="button"
              onClick={() => rejectMutation.mutate({ projectId: id, reason: "Non conforme" })}
              className="rounded-lg bg-red-600 px-3 py-2 text-white"
              disabled={rejectMutation.isPending}
            >
              Rejeter
            </button>
          </div>
        </div>
      )}
    </Section>
  );
}

export function AdminCollectePage() {
  const ordersQuery = trpc.admin.orders.useQuery({});
  return (
    <Section title="Admin / Te Raga / Collecte">
      <div className="space-y-2">
        {(ordersQuery.data ?? []).map((order) => (
          <div key={order.id} className="rounded-xl border bg-white p-4 text-sm flex justify-between">
            <span>{order.orderCode}</span>
            <span>{order.collectionStatus}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function AdminBailleursReportPage() {
  const statsQuery = trpc.admin.stats.useQuery();
  return (
    <Section title="Admin / Rapports / Bailleurs">
      <div className="rounded-xl border bg-white p-4 text-sm space-y-1">
        <p>Montant total dons: {fmt(statsQuery.data?.donations ?? 0)}</p>
        <p>Revenu total: {fmt(statsQuery.data?.revenue ?? 0)}</p>
      </div>
    </Section>
  );
}
