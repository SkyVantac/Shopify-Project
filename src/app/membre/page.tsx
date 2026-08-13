import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DeconnexionBouton from "./deconnexion-bouton";

export default async function MembrePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  // Deuxième vérification, indépendante du middleware : on ne fait
  // confiance qu'à ce qui est stocké en base, jamais à l'URL ou à un
  // état côté navigateur.
  const { data: abonne } = await supabase
    .from("abonnes")
    .select("statut")
    .eq("id", user.id)
    .maybeSingle();

  if (abonne?.statut !== "actif") {
    redirect("/paiement-en-attente");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="mb-4 text-sm font-medium uppercase tracking-widest text-zinc-500">
        Espace membre
      </p>
      <h1 className="max-w-xl text-3xl font-semibold tracking-tight">
        Bienvenue dans le cercle SKY VANTAC
      </h1>
      <p className="mt-4 text-zinc-600">
        Connecté en tant que <strong>{user.email}</strong> — abonnement actif.
      </p>
      <div className="mt-10">
        <DeconnexionBouton />
      </div>
    </main>
  );
}
