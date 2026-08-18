"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6">
        <div className="flex items-center gap-10">
          <Link href="/accueil" className="text-lg font-semibold tracking-tight">
            SKY VANTAC
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
                      ? "text-zinc-900"
                      : "text-zinc-500 transition-colors hover:text-zinc-900"
                  }
                >
                  {lien.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/marchandises"
            aria-label="Recherche"
            className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            🔍
          </Link>

          <MenuDeroulant ariaLabel="Notifications" bouton="🔔">
            <p className="px-4 py-3 text-sm text-zinc-500">
              Aucune notification pour l&apos;instant.
            </p>
          </MenuDeroulant>

          <MenuDeroulant
            ariaLabel="Publier"
            bouton="+ Publier"
            boutonClassName="flex h-10 items-center gap-1 whitespace-nowrap rounded-full bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            <div className="flex items-center justify-between px-4 py-3 text-sm text-zinc-400">
              Publier une marchandise
              <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">
                Bientôt
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 text-sm text-zinc-400">
              Publier une recherche
              <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">
                Bientôt
              </span>
            </div>
          </MenuDeroulant>

          <MenuDeroulant ariaLabel="Profil" bouton="👤">
            <div className="truncate border-b border-zinc-100 px-4 py-3 text-sm text-zinc-500">
              {emailUtilisateur}
            </div>
            <Link
              href="/mon-espace"
              className="block px-4 py-2.5 text-sm hover:bg-zinc-50"
            >
              Mon Espace
            </Link>
            <Link
              href="/mon-espace"
              className="block px-4 py-2.5 text-sm hover:bg-zinc-50"
            >
              Paramètres
            </Link>
            {estAdmin && (
              <Link
                href="/admin"
                className="block px-4 py-2.5 text-sm hover:bg-zinc-50"
              >
                Admin
              </Link>
            )}
            <button
              type="button"
              onClick={seDeconnecter}
              className="block w-full px-4 py-2.5 text-left text-sm text-red-700 hover:bg-red-50"
            >
              Se déconnecter
            </button>
          </MenuDeroulant>
        </div>
      </div>
    </header>
  );
}
