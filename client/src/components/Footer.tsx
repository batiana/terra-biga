import { Link } from "wouter";

const LOGO_FULL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663373135176/CVgkfXXzqFTyhJrb.png";

export default function Footer() {
  return (
    <footer className="bg-foreground text-white/80">
      <div className="container py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img
                src={LOGO_FULL}
                alt="Terra Biga"
                className="h-10 w-auto brightness-0 invert"
                loading="lazy"
              />
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
              <li><Link href="/actualites" className="hover:text-white transition-colors">Actualités</Link></li>
              <li><Link href="/a-propos" className="hover:text-white transition-colors">À propos</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><span className="cursor-default">Conditions d'utilisation</span></li>
              <li><span className="cursor-default">Confidentialité</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>Rue Teend Beogo, Ouagadougou</li>
              <li>Burkina Faso</li>
              <li><a href="mailto:contact@terrabiga.com" className="hover:text-white transition-colors">contact@terrabiga.com</a></li>
              <li><a href="tel:+22602283893" className="hover:text-white transition-colors">+226 02 28 38 93</a></li>
            </ul>
          </div>
        </div>

        {/* Partners strip */}
        <div className="border-t border-white/10 mt-8 pt-6 mb-6">
          <p className="text-xs text-white/40 text-center mb-4 uppercase tracking-wider">Nos partenaires</p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 opacity-60">
            <span className="text-xs font-semibold text-white/70">Orange</span>
            <span className="text-xs font-semibold text-white/70">Lefaso.net</span>
            <span className="text-xs font-semibold text-white/70">Kéré Architecture</span>
            <span className="text-xs font-semibold text-white/70">Min. des Finances</span>
            <span className="text-xs font-semibold text-white/70">PNUD</span>
            <span className="text-xs font-semibold text-white/70">Min. Transition Digitale</span>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/40">
            <p>&copy; 2025 Terra Biga — Tous droits réservés</p>
            <p className="text-center">Lauréate Faso Digital & POESAM &middot; Membre Orange Fab</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
