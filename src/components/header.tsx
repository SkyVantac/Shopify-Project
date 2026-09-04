"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import LogoMeridien from "./logo-meridien";
import MenuDeroulant from "./menu-deroulant";

const LIENS_NAV = [
  { href: "/accueil", label: "Accueil" },
  { href: "/marchandises", label: "Marchandises" },
  { href: "/recherches", label: "Recherches" },
  { href: "/messages", label: "Messages" },
];

type HeaderProps = {
  emailUtilisateur: string;
  estAdmin: boolean;
};

export default function Header({ emailUtilisateur, estAdmin }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function seDeconnecter() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6">
        <div className="flex items-center gap-10">
          <Link href="/accueil" className="flex items-center gap-2">
            <LogoMeridien size={22} />
            <span className="font-playfair text-lg font-semibold tracking-[.07em] text-parchment">
              SKY VANTAC
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
            {LIENS_NAV.map((lien) => {
              const actif = pathname === lien.href;
              return (
                <Link
                  key={lien.href}
                  href={lien.href}
                  className={
                    actif
                      ? "text-parchment"
                      : "text-muted transition-colors hover:text-parchment"
                  }
                >
                  {lien.label}
                </Link>
              );
            })}
            {estAdmin && (
              <Link
                href="/admin"
                className={
                  pathname === "/admin"
                    ? "text-parchment"
                    : "text-muted transition-colors hover:text-parchment"
                }
              >
                Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/marchandises"
            aria-label="Recherche"
            className="flex h-10 w-10 items-center justify-center rounded-brand text-muted transition-colors hover:bg-ink-2 hover:text-parchment"
          >
            🔍
          </Link>

          <MenuDeroulant ariaLabel="Notifications" bouton="🔔">
            <p className="px-4 py-3 text-sm text-muted">
              Aucune notification pour l&apos;instant.
            </p>
          </MenuDeroulant>

          <MenuDeroulant
            ariaLabel="Publier"
            bouton="+ Publier"
            boutonClassName="flex h-10 items-center gap-1 whitespace-nowrap rounded-brand bg-accent px-5 text-sm font-semibold text-ink transition-colors hover:bg-accent-2"
          >
            <Link
              href="/marchandises/nouvelle"
              className="block px-4 py-3 text-sm text-parchment hover:bg-ink"
            >
              Publier une marchandise
            </Link>
            <div className="flex items-center justify-between px-4 py-3 text-sm text-dim">
              Publier une recherche
              <span className="ml-2 rounded-brand bg-ink px-2 py-0.5 text-xs text-muted">
                Bientôt
              </span>
            </div>
          </MenuDeroulant>

          <MenuDeroulant ariaLabel="Profil" bouton="👤">
            <div className="truncate border-b border-line px-4 py-3 text-sm text-muted">
              {emailUtilisateur}
            </div>
            <Link
              href="/mon-espace"
              className="block px-4 py-2.5 text-sm text-parchment hover:bg-ink"
            >
              Mon Espace
            </Link>
            <Link
              href="/mon-espace"
              className="block px-4 py-2.5 text-sm text-parchment hover:bg-ink"
            >
              Paramètres
            </Link>
            {estAdmin && (
              <Link
                href="/admin"
                className="block px-4 py-2.5 text-sm text-parchment hover:bg-ink"
              >
                Admin
              </Link>
            )}
            <button
              type="button"
              onClick={seDeconnecter}
              className="block w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-ink"
            >
              Se déconnecter
            </button>
          </MenuDeroulant>
        </div>
      </div>
    </header>
  );
}
