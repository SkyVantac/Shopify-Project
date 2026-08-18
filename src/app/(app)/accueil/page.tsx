import { createClient } from "@/lib/supabase/server";
import CarteVide from "@/components/carte-vide";

function extrairePrenom(email: string) {
  const partieLocale = email.split("@")[0] ?? "";
  const premierMot = partieLocale.split(/[.\-_+]/)[0] ?? partieLocale;
  return premierMot.charAt(0).toUpperCase() + premierMot.slice(1);
}

export default async function AccueilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const prenom = user?.email ? extrairePrenom(user.email) : "";

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">
        Bonjour {prenom}
      </h1>

      <input
        type="text"
        placeholder="Rechercher une marchandise, un pays, un mot-clé..."
        className="mt-6 w-full rounded-full border border-zinc-300 bg-white px-6 py-4 text-sm outline-none focus:border-zinc-900"
      />

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CarteVide
          titre="Nouvelles marchandises"
          message="Rien à afficher pour l'instant."
        />
        <CarteVide titre="Pour vous" message="Rien à afficher pour l'instant." />
        <CarteVide
          titre="Recherches récentes"
          message="Rien à afficher pour l'instant."
        />
        <CarteVide
          titre="Votre activité"
          message="Rien à afficher pour l'instant."
        />
      </div>
    </main>
  );
}
