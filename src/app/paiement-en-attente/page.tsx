"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PaiementEnAttentePage() {
  const router = useRouter();
  const [verification, setVerification] = useState(false);

  async function verifierStatut() {
    setVerification(true);
    try {
      const reponse = await fetch("/api/statut");
      const { statut } = await reponse.json();
      if (statut === "actif") {
        router.push("/membre");
        router.refresh();
        return;
      }
    } finally {
      setVerification(false);
    }
  }

  // On revérifie automatiquement toutes les 4 secondes : dès que Stripe
  // confirme le paiement (webhook), l'accès s'ouvre sans que l'utilisateur
  // ait besoin de faire quoi que ce soit.
  useEffect(() => {
    const intervalle = setInterval(verifierStatut, 4000);
    return () => clearInterval(intervalle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="mb-4 text-sm font-medium uppercase tracking-widest text-zinc-500">
        Un instant
      </p>
      <h1 className="max-w-lg text-3xl font-semibold tracking-tight">
        On confirme ton paiement...
      </h1>
      <p className="mt-4 max-w-md text-zinc-600">
        Si tu viens de payer sur Stripe, l&apos;accès à ton espace membre
        s&apos;ouvre automatiquement dès que le paiement est confirmé
        (quelques secondes en général). Cette page se met à jour toute
        seule.
      </p>
      <button
        onClick={verifierStatut}
        disabled={verification}
        className="mt-10 rounded-full bg-zinc-900 px-8 py-3 text-base font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
      >
        {verification ? "Vérification..." : "Vérifier maintenant"}
      </button>
    </main>
  );
}
