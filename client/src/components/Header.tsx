import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu, X, User, LogOut, ChevronRight } from "lucide-react";

const navItems = [
  { label: "Accueil", href: "/" },
  { label: "Te Raga", href: "/te-raga" },
  { label: "Ma Cagnotte", href: "/ma-cagnotte" },
  { label: "Don BIGA CONNECT", href: "/don-biga-connect" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container flex items-center justify-between h-14 sm:h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-tb-orange to-tb-green flex items-center justify-center">
            <span className="text-white font-bold text-sm sm:text-base">TB</span>
          </div>
          <span className="font-bold text-lg sm:text-xl text-foreground hidden sm:inline">Terra Biga</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location === item.href
                  ? "bg-tb-green/10 text-tb-green"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Link href="/profil">
              <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                <User className="w-4 h-4" />
                <span>{user?.name || "Mon Profil"}</span>
              </Button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <Button size="sm" className="hidden sm:flex bg-tb-green hover:bg-tb-green/90 text-white">
                Connexion
              </Button>
            </a>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-accent"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-tb-orange to-tb-green flex items-center justify-center">
                <span className="text-white font-bold text-sm">TB</span>
              </div>
              Terra Biga
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col p-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  location === item.href
                    ? "bg-tb-green/10 text-tb-green"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                {item.label}
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            ))}
            <div className="border-t my-2" />
            {isAuthenticated ? (
              <>
                <Link
                  href="/profil"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium hover:bg-accent"
                >
                  <User className="w-5 h-5" />
                  Mon Profil
                </Link>
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-5 h-5" />
                  Déconnexion
                </button>
              </>
            ) : (
              <a
                href={getLoginUrl()}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-tb-green hover:bg-tb-green/10"
              >
                <User className="w-5 h-5" />
                Connexion
              </a>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
