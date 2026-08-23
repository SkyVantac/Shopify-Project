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
    <main className="flex-1 bg-ink px-6 py-10 text-parchment">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="font-playfair text-2xl font-semibold tracking-[.07em]">
          Bonjour {prenom}
        </h1>

        <input
          type="text"
          placeholder="Rechercher une marchandise, un pays, un mot-clé..."
          className="mt-6 w-full rounded-brand border border-line bg-ink-2 px-6 py-4 text-sm text-parchment outline-none placeholder:text-dim focus:border-accent"
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
      </div>
    </main>
  );
}
