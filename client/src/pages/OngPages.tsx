import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useMemo, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";

export function BecomeMemberPage() {
  return (
    <Layout>
      <div className="container py-10">
        <h1 className="text-2xl font-bold">Devenir membre</h1>
      </div>
    </Layout>
  );
}

export function OngHomePage() {
  return (
    <Layout>
      <div className="container py-10 space-y-3">
        <h1 className="text-2xl font-bold">Dashboard ONG</h1>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/ong/soumettre" className="text-orange-600">Soumettre un projet</Link>
          <Link href="/ong/organisation" className="text-orange-600">Mon organisation</Link>
          <Link href="/ong/projets" className="text-orange-600">Mes projets</Link>
        </div>
      </div>
    </Layout>
  );
}

export function OngSubmitPage() {
  const [, navigate] = useLocation();
  const orgMutation = trpc.organizations.create.useMutation();
  const projectMutation = trpc.projects.create.useMutation();

  const [step, setStep] = useState(1);
  const [org, setOrg] = useState({
    name: "",
    legalRepresentative: "",
    registrationNumber: "",
    phone: "",
    email: "",
    address: "",
    description: "",
  });
  const [project, setProject] = useState({
    title: "",
    description: "",
    targetAmount: "",
  });

  async function handleSubmit() {
    const organization = await orgMutation.mutateAsync(org);
    if (!organization?.id) return;

    await projectMutation.mutateAsync({
      organizationId: organization.id,
      title: project.title,
      description: project.description,
      targetAmount: project.targetAmount ? Number(project.targetAmount) : undefined,
    });

    navigate(`/ong/projets?organizationId=${organization.id}`);
  }

  return (
    <Layout>
      <div className="container py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-2">Soumettre un projet ONG</h1>
        <p className="text-sm text-muted-foreground mb-6">Étape {step}/3</p>

        {step === 1 && (
          <div className="space-y-4">
            <div><Label>Nom de l'organisation</Label><Input value={org.name} onChange={(e) => setOrg({ ...org, name: e.target.value })} /></div>
            <div><Label>Représentant légal</Label><Input value={org.legalRepresentative} onChange={(e) => setOrg({ ...org, legalRepresentative: e.target.value })} /></div>
            <div><Label>Numéro d'enregistrement</Label><Input value={org.registrationNumber} onChange={(e) => setOrg({ ...org, registrationNumber: e.target.value })} /></div>
            <div><Label>Téléphone</Label><Input value={org.phone} onChange={(e) => setOrg({ ...org, phone: e.target.value })} /></div>
            <div><Label>Email</Label><Input value={org.email} onChange={(e) => setOrg({ ...org, email: e.target.value })} /></div>
            <div><Label>Adresse</Label><Textarea value={org.address} onChange={(e) => setOrg({ ...org, address: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={org.description} onChange={(e) => setOrg({ ...org, description: e.target.value })} /></div>
            <Button onClick={() => setStep(2)} className="bg-orange-500 hover:bg-orange-600 text-white">Continuer</Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div><Label>Titre du projet</Label><Input value={project.title} onChange={(e) => setProject({ ...project, title: e.target.value })} /></div>
            <div><Label>Description du projet</Label><Textarea value={project.description} onChange={(e) => setProject({ ...project, description: e.target.value })} /></div>
            <div><Label>Objectif (FCFA)</Label><Input type="number" value={project.targetAmount} onChange={(e) => setProject({ ...project, targetAmount: e.target.value })} /></div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>Retour</Button>
              <Button type="button" onClick={() => setStep(3)} className="bg-orange-500 hover:bg-orange-600 text-white">Continuer</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm">Le projet sera soumis avec le statut SUBMITTED et devra être approuvé par un admin.</p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>Retour</Button>
              <Button
                type="button"
                onClick={handleSubmit}
                className="bg-orange-500 hover:bg-orange-600 text-white"
                disabled={orgMutation.isPending || projectMutation.isPending}
              >
                {orgMutation.isPending || projectMutation.isPending ? "Envoi..." : "Confirmer"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export function OngOrganizationPage() {
  return (
    <Layout>
      <div className="container py-10">
        <h1 className="text-2xl font-bold">Mon organisation</h1>
      </div>
    </Layout>
  );
}

export function OngProjectsPage() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const organizationId = Number(params.get("organizationId") ?? "0");
  const projectsQuery = trpc.projects.byOrganization.useQuery(
    { organizationId },
    { enabled: organizationId > 0 }
  );

  return (
    <Layout>
      <div className="container py-10 space-y-3">
        <h1 className="text-2xl font-bold">Mes projets ONG</h1>
        {organizationId <= 0 ? (
          <p className="text-sm text-muted-foreground">Ajoutez `?organizationId=...` dans l'URL pour charger les projets.</p>
        ) : (
          <div className="space-y-2">
            {(projectsQuery.data ?? []).map((project) => (
              <Link key={project.id} href={`/ong/projets/${project.id}`}>
                <div className="rounded-xl border bg-white p-4 text-sm hover:border-orange-300 transition">
                  <p className="font-medium">{project.title}</p>
                  <p className="text-muted-foreground">{project.status}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export function OngProjectPage() {
  const [, params] = useRoute("/ong/projets/:id");
  const id = Number(params?.id ?? "0");
  const projectQuery = trpc.projects.byId.useQuery({ id }, { enabled: id > 0 });

  return (
    <Layout>
      <div className="container py-10 space-y-3">
        <h1 className="text-2xl font-bold">Projet ONG</h1>
        {projectQuery.data && (
          <div className="rounded-xl border bg-white p-4 text-sm space-y-1">
            <p className="font-medium">{projectQuery.data.title}</p>
            <p className="text-muted-foreground">{projectQuery.data.status}</p>
            <p>{projectQuery.data.description || "-"}</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

export function OngProjectUpdatePage() {
  const [, params] = useRoute("/ong/projets/:id/update");
  return (
    <Layout>
      <div className="container py-10">
        <h1 className="text-2xl font-bold">Mettre à jour le projet ONG #{params?.id ?? ""}</h1>
      </div>
    </Layout>
  );
}

export function OngProjectDocsPage() {
  const [, params] = useRoute("/ong/projets/:id/docs");
  return (
    <Layout>
      <div className="container py-10">
        <h1 className="text-2xl font-bold">Documents projet ONG #{params?.id ?? ""}</h1>
      </div>
    </Layout>
  );
}
