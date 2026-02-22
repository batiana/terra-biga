import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-foreground text-white/80">
      <div className="container py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-tb-orange to-tb-green flex items-center justify-center">
                <span className="text-white font-bold text-sm">TB</span>
              </div>
              <span className="font-bold text-lg text-white">Terra Biga</span>
            </div>
            <p className="text-sm leading-relaxed text-white/60">
              La première plateforme communautaire d'achat groupé et de cagnotte collective en Afrique de l'Ouest.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/te-raga" className="hover:text-white transition-colors">Te Raga — Achat groupé</Link></li>
              <li><Link href="/ma-cagnotte" className="hover:text-white transition-colors">Ma Cagnotte</Link></li>
              <li><Link href="/ma-cagnotte/creer" className="hover:text-white transition-colors">Créer une cagnotte</Link></li>
            </ul>
          </div>

          {/* Liens */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Liens</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Accueil</Link></li>
              <li><a href="/#a-propos" className="hover:text-white transition-colors">À propos</a></li>
              <li><a href="/#contact" className="hover:text-white transition-colors">Contact</a></li>
              <li><span className="cursor-default">Conditions d'utilisation</span></li>
              <li><span className="cursor-default">Confidentialité</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>Ouagadougou, Burkina Faso</li>
              <li>contact@terrabiga.com</li>
              <li>+226 70 00 00 00</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/40">
            <p>&copy; 2025 Terra Biga — Tous droits réservés</p>
            <p className="text-center">Lauréate Faso Digital & POESAM &middot; Membre Orange Fab &middot; Partenaire Lefaso.net</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
