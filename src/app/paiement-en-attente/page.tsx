"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Statut = "en_attente" | "en_revue" | "actif" | "refuse" | "annule" | null;
type StatutAffiche = Exclude<Statut, "actif" | null>;

const CONTENU: Record<StatutAffiche, { titre: string; texte: string }> = {
  en_attente: {
    titre: "Paiement non terminé",
    texte:
      "Il semble que le paiement n'ait pas encore été confirmé. Si tu penses que c'est une erreur, retourne sur la page d'inscription pour réessayer.",
  },
  en_revue: {
    titre: "Ta candidature est en cours de vérification",
    texte:
      "Ton paiement est bien confirmé. Notre équipe examine chaque candidature manuellement avant d'ouvrir l'accès au cercle — tu auras une réponse sous 24h. Cette page se met à jour automatiquement.",
  },
  refuse: {
    titre: "Candidature non retenue",
    texte:
      "Ta candidature n'a pas été retenue cette fois-ci. Le paiement te sera remboursé. Pour toute question, contacte-nous directement.",
  },
  annule: {
    titre: "Abonnement inactif",
    texte:
      "Ton abonnement n'est plus actif. Contacte-nous si tu penses que c'est une erreur.",
  },
};

export default function PaiementEnAttentePage() {
  const router = useRouter();
  const [verification, setVerification] = useState(false);
  const [statut, setStatut] = useState<StatutAffiche | null>(null);

  async function verifierStatut() {
    setVerification(true);
    try {
      const reponse = await fetch("/api/statut");
      const { statut: statutRecu } = await reponse.json();
      if (statutRecu === "actif") {
        router.push("/accueil");
        router.refresh();
        return;
      }
      setStatut(statutRecu ?? "en_attente");
    } finally {
      setVerification(false);
    }
  }

  // On revérifie automatiquement toutes les 4 secondes : dès que Stripe
  // confirme le paiement, ou qu'un admin valide la candidature, l'accès
  // s'ouvre sans que l'utilisateur ait besoin de faire quoi que ce soit.
  useEffect(() => {
    const intervalle = setInterval(verifierStatut, 4000);
    return () => clearInterval(intervalle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contenu = CONTENU[statut ?? "en_revue"] ?? CONTENU.en_revue;

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="mb-4 text-sm font-medium uppercase tracking-widest text-zinc-500">
        Un instant
      </p>
      <h1 className="max-w-lg text-3xl font-semibold tracking-tight">
        {contenu.titre}
      </h1>
      <p className="mt-4 max-w-md text-zinc-600">{contenu.texte}</p>
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
