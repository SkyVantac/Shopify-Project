import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { estAdmin } from "@/lib/admin";
import { recupererMesMarchandises } from "@/lib/marchandises-serveur";
import { badgeStatutMarchandise } from "@/lib/marchandises";
import LogoMeridien from "@/components/logo-meridien";
import BoutonPrimaire from "@/components/bouton-primaire";

export default async function MonEspacePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Un admin peut arriver ici sans être "actif" (il ne paie pas
  // d'abonnement) : on évite de lui afficher à tort le badge "Actif".
  const admin = estAdmin(user?.email);
  const mesMarchandises = await recupererMesMarchandises();

  return (
    <main className="flex-1 bg-ink px-6 py-10 text-parchment">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex items-center gap-3">
          <LogoMeridien size={28} />
          <h1 className="font-playfair text-3xl font-semibold tracking-[.07em]">
            Mon Espace
          </h1>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-card border border-line bg-ink-2 p-6">
            <h2 className="font-playfair text-sm font-semibold tracking-[.14em] uppercase">
              Profil
            </h2>
            <p className="mt-2 text-sm text-muted">{user?.email}</p>
            <div className="mt-4">
              <BoutonPrimaire>Modifier mon profil</BoutonPrimaire>
            </div>
          </div>

          <div className="rounded-card border border-line bg-ink-2 p-6">
            <h2 className="font-playfair text-sm font-semibold tracking-[.14em] uppercase">
              Abonnement
            </h2>
            <p className="mt-2 inline-flex items-center rounded-brand border border-accent px-3 py-1 text-xs font-medium text-accent">
              {admin ? "Accès admin" : "Actif"}
            </p>
          </div>

          <div className="rounded-card border border-line bg-ink-2 p-6 sm:col-span-2">
            <h2 className="font-playfair text-sm font-semibold tracking-[.14em] uppercase">
              Mes marchandises
            </h2>
            {mesMarchandises.length === 0 ? (
              <p className="mt-2 text-sm text-dim">
                Vous n&apos;avez rien publié pour l&apos;instant.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-line">
                {mesMarchandises.map((marchandise) => {
                  const badge = badgeStatutMarchandise(marchandise.statut);
                  return (
                    <li
                      key={marchandise.id}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <Link
                        href={`/marchandises/${marchandise.id}`}
                        className="truncate text-sm text-parchment transition-colors hover:text-accent"
                      >
                        {marchandise.titre}
                      </Link>
                      <span
                        className={`shrink-0 rounded-brand border px-2 py-0.5 text-xs font-medium ${badge.classe}`}
                      >
                        {badge.texte}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
