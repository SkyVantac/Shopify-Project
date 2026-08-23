import { createClient } from "@/lib/supabase/server";
import { estAdmin } from "@/lib/admin";
import LogoMeridien from "@/components/logo-meridien";
import BoutonPrimaire from "@/components/bouton-primaire";

// Page témoin du design system SKY VANTAC (repris de la vitrine). Seule
// cette page est stylée ainsi pour l'instant — le reste de l'app garde
// son apparence claire actuelle tant que ce témoin n'est pas validé.
export default async function MonEspacePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Un admin peut arriver ici sans être "actif" (il ne paie pas
  // d'abonnement) : on évite de lui afficher à tort le badge "Actif".
  const admin = estAdmin(user?.email);

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
            <p className="mt-2 text-sm text-dim">
              Vous n&apos;avez rien publié pour l&apos;instant.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
