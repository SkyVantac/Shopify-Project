"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ChampTexte from "@/components/champ-texte";
import BoutonPrimaire from "@/components/bouton-primaire";

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
    <main className="flex flex-1 flex-col items-center justify-center bg-ink px-6 py-24">
      <div className="w-full max-w-sm">
        <h1 className="font-playfair mb-2 text-2xl font-semibold tracking-[.07em] text-parchment">
          Créer ton compte
        </h1>
        <p className="mb-8 text-sm text-muted">
          Étape 1 sur 2 : ensuite tu seras redirigé vers le paiement sécurisé
          Stripe (1000&nbsp;€ / an).
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <ChampTexte
            id="email"
            label="E-mail professionnel"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="toi@entreprise.com"
          />

          <ChampTexte
            id="motDePasse"
            label="Mot de passe"
            type="password"
            required
            minLength={8}
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            placeholder="8 caractères minimum"
          />

          {erreur && (
            <p className="rounded-brand border border-red-900 bg-red-950/40 px-4 py-2.5 text-sm text-red-300">
              {erreur}
            </p>
          )}

          <BoutonPrimaire type="submit" disabled={enCours} className="mt-2 disabled:opacity-50">
            {enCours ? "Un instant..." : "Continuer vers le paiement"}
          </BoutonPrimaire>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Déjà membre ?{" "}
          <a href="/connexion" className="font-medium text-accent underline">
            Se connecter
          </a>
        </p>
      </div>
    </main>
  );
}
