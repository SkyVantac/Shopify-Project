"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function InscriptionPage() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setEnCours(true);

    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password: motDePasse,
    });

    if (error) {
      setErreur(error.message);
      setEnCours(false);
      return;
    }

    if (!data.session) {
      setErreur(
        "Ton compte a été créé, mais aucune session n'a été ouverte. Vérifie que la confirmation par e-mail est bien désactivée dans Supabase (Authentication -> Providers -> Email), puis réessaie."
      );
      setEnCours(false);
      return;
    }

    // Le compte est créé et l'utilisateur est connecté : on l'envoie
    // vers Stripe pour payer l'abonnement.
    const reponse = await fetch("/api/checkout", { method: "POST" });
    const resultat = await reponse.json();

    if (!reponse.ok || !resultat.url) {
      setErreur(
        resultat.erreur ?? "Impossible de démarrer le paiement. Réessaie dans un instant."
      );
      setEnCours(false);
      return;
    }

    window.location.href = resultat.url;
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-2xl font-semibold">Créer ton compte</h1>
        <p className="mb-8 text-sm text-zinc-600">
          Étape 1 sur 2 : ensuite tu seras redirigé vers le paiement sécurisé
          Stripe (1000&nbsp;€ / an).
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              E-mail professionnel
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 outline-none focus:border-zinc-900"
              placeholder="toi@entreprise.com"
            />
          </div>

          <div>
            <label
              htmlFor="motDePasse"
              className="mb-1 block text-sm font-medium"
            >
              Mot de passe
            </label>
            <input
              id="motDePasse"
              type="password"
              required
              minLength={8}
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 outline-none focus:border-zinc-900"
              placeholder="8 caractères minimum"
            />
          </div>

          {erreur && (
            <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {erreur}
            </p>
          )}

          <button
            type="submit"
            disabled={enCours}
            className="mt-2 rounded-full bg-zinc-900 px-8 py-3 text-base font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
          >
            {enCours ? "Un instant..." : "Continuer vers le paiement"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600">
          Déjà membre ?{" "}
          <a href="/connexion" className="font-medium text-zinc-900 underline">
            Se connecter
          </a>
        </p>
      </div>
    </main>
  );
}
