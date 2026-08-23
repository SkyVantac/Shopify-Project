"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ChampTexte from "@/components/champ-texte";
import BoutonPrimaire from "@/components/bouton-primaire";

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setEnCours(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: motDePasse,
    });

    if (error) {
      setErreur("E-mail ou mot de passe incorrect.");
      setEnCours(false);
      return;
    }

    // La page /accueil vérifie elle-même (côté serveur) si l'abonnement
    // est actif ; sinon elle renverra automatiquement vers la page d'attente.
    router.push("/accueil");
    router.refresh();
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-ink px-6 py-24">
      <div className="w-full max-w-sm">
        <h1 className="font-playfair mb-8 text-2xl font-semibold tracking-[.07em] text-parchment">
          Se connecter
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <ChampTexte
            id="email"
            label="E-mail"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <ChampTexte
            id="motDePasse"
            label="Mot de passe"
            type="password"
            required
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
          />

          {erreur && (
            <p className="rounded-brand border border-red-900 bg-red-950/40 px-4 py-2.5 text-sm text-red-300">
              {erreur}
            </p>
          )}

          <BoutonPrimaire type="submit" disabled={enCours} className="mt-2 disabled:opacity-50">
            {enCours ? "Un instant..." : "Se connecter"}
          </BoutonPrimaire>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Pas encore membre ?{" "}
          <a href="/inscription" className="font-medium text-accent underline">
            Créer un compte
          </a>
        </p>
      </div>
    </main>
  );
}
