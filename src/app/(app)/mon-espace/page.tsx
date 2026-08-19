import { createClient } from "@/lib/supabase/server";
import { estAdmin } from "@/lib/admin";
import CarteVide from "@/components/carte-vide";

export default async function MonEspacePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Un admin peut arriver ici sans être "actif" (il ne paie pas
  // d'abonnement) : on évite de lui afficher à tort le badge "Actif".
  const admin = estAdmin(user?.email);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Mon Espace</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-zinc-900">Profil</h2>
          <p className="mt-2 text-sm text-zinc-500">{user?.email}</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-zinc-900">Abonnement</h2>
          <p className="mt-2 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            {admin ? "Accès admin" : "Actif"}
          </p>
        </div>

        <CarteVide
          titre="Mes marchandises"
          message="Vous n'avez rien publié pour l'instant."
        />
      </div>
    </main>
  );
}
