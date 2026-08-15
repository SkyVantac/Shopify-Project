// Liste blanche très simple : les e-mails autorisés à accéder à /admin
// sont définis dans la variable d'environnement ADMIN_EMAILS (séparés
// par des virgules). Personne d'autre ne peut y accéder, quel que soit
// son statut d'abonnement.
export function estAdmin(email: string | null | undefined): boolean {
  if (!email) return false;

  const emailsAutorises = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return emailsAutorises.includes(email.toLowerCase());
}
