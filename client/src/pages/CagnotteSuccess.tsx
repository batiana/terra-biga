/**
 * CagnotteSuccess.tsx
 * Page affichée après création réussie d'une cagnotte.
 * Route : /mam-cagnotte/succes/:slug  (et /c/:slug redirige déjà vers CagnottePublic)
 *
 * Cette page s'affiche brièvement avant que l'utilisateur soit redirigé
 * vers la page publique de sa cagnotte. Elle permet le partage immédiat.
 */

import Layout from "@/components/Layout";
import ShareCagnotte from "@/components/ShareCagnotte";
import { trpc } from "@/lib/trpc";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, LayoutDashboard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CagnotteSuccess() {
  const [, params] = useRoute("/mam-cagnotte/succes/:slug");
  const slug = params?.slug ?? "";

  const cagnotteQuery = trpc.cagnottes.bySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );
  const cagnotte = cagnotteQuery.data;

  return (
    <Layout>
      <div className="container py-12 sm:py-20 max-w-lg mx-auto text-center">
        {/* Icône succès */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          🎉 Ta cagnotte est en ligne !
        </h1>
        <p className="text-gray-600 mb-8">
          Partage-la maintenant pour commencer à recevoir des contributions.
        </p>

        {/* Lien unique */}
        {cagnotteQuery.isLoading ? (
          <Skeleton className="h-12 w-full rounded-xl mb-6" />
        ) : cagnotte ? (
          <>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 text-left">
              <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Ton lien unique</p>
              <p className="text-orange-700 font-mono text-sm break-all font-semibold">
                terrabiga.com/c/{cagnotte.slug}
              </p>
            </div>

            {/* Boutons partage */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3 font-medium">Partage sur :</p>
              <ShareCagnotte cagnotte={cagnotte} variant="button" className="w-full" />
            </div>
          </>
        ) : null}

        {/* Actions secondaires */}
        <div className="flex flex-col sm:flex-row gap-3">
          {cagnotte && (
            <Link href={`/c/${cagnotte.slug}`} className="flex-1">
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 rounded-xl gap-2">
                Voir ma cagnotte
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
          <Link href="/dashboard" className="flex-1">
            <Button variant="outline" className="w-full h-12 rounded-xl gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Mon espace
            </Button>
          </Link>
        </div>

        {/* Note pour cagnottes en révision */}
        {cagnotte?.status === "pending_review" && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700 text-left">
            ⏳ <strong>Ta cagnotte est en cours de validation.</strong><br />
            Les cagnottes Santé et Association/ONG sont vérifiées sous 5 à 10 jours ouvrables. Tu recevras une confirmation par WhatsApp.
          </div>
        )}
      </div>
    </Layout>
  );
}
