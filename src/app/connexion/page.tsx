"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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

    // La page /membre vérifie elle-même (côté serveur) si l'abonnement
    // est actif ; sinon elle renverra automatiquement vers la page d'attente.
    router.push("/membre");
    router.refresh();
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-2xl font-semibold">Se connecter</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 outline-none focus:border-zinc-900"
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
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 outline-none focus:border-zinc-900"
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
            {enCours ? "Un instant..." : "Se connecter"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600">
          Pas encore membre ?{" "}
          <a href="/inscription" className="font-medium text-zinc-900 underline">
            Créer un compte
          </a>
        </p>
      </div>
    </main>
  );
}
