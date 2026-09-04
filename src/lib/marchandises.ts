// Listes partagées entre le formulaire (affichage des libellés) et la
// Server Action (validation) — une seule source de vérité, alignée sur
// les contraintes "check" de supabase/migration-03-marchandises.sql.

export const CATEGORIES = [
  { valeur: "electronique_hightech", libelle: "Électronique & high-tech" },
  { valeur: "electromenager_maison", libelle: "Électroménager & maison" },
  { valeur: "textile_mode_accessoires", libelle: "Textile, mode & accessoires" },
  {
    valeur: "beaute_cosmetique_parfumerie",
    libelle: "Beauté, cosmétique & parfumerie",
  },
  { valeur: "alimentaire_boissons", libelle: "Alimentaire & boissons" },
  {
    valeur: "sante_hygiene_parapharmacie",
    libelle: "Santé, hygiène & parapharmacie",
  },
  {
    valeur: "jouets_puericulture_loisirs",
    libelle: "Jouets, puériculture & loisirs",
  },
  {
    valeur: "bricolage_outillage_industrie",
    libelle: "Bricolage, outillage & industrie",
  },
  { valeur: "auto_moto_pieces", libelle: "Auto, moto & pièces" },
  { valeur: "sport_plein_air", libelle: "Sport & plein air" },
  {
    valeur: "matieres_premieres_emballage",
    libelle: "Matières premières & emballage",
  },
  {
    valeur: "lots_multi_categories",
    libelle: "Lots multi-catégories / déstockage mixte",
  },
  { valeur: "autre", libelle: "Autre" },
] as const;

export const ETATS_MARCHANDISE = [
  { valeur: "neuf", libelle: "Neuf" },
  { valeur: "reconditionne", libelle: "Reconditionné" },
  { valeur: "surplus_destockage", libelle: "Surplus / déstockage" },
  { valeur: "occasion", libelle: "Occasion" },
] as const;

export const UNITES = [
  { valeur: "pieces", libelle: "Pièces" },
  { valeur: "kg", libelle: "Kg" },
  { valeur: "tonnes", libelle: "Tonnes" },
  { valeur: "palettes", libelle: "Palettes" },
  { valeur: "conteneurs", libelle: "Conteneurs" },
  { valeur: "cartons", libelle: "Cartons" },
] as const;

export const DEVISES = [
  { valeur: "EUR", libelle: "EUR" },
  { valeur: "USD", libelle: "USD" },
  { valeur: "GBP", libelle: "GBP" },
  { valeur: "CHF", libelle: "CHF" },
] as const;

export const MAX_PHOTOS = 8;
export const TAILLE_PHOTO_MAX_OCTETS = 5 * 1024 * 1024; // 5 Mo, cohérent avec le bucket

export function libelleCategorie(valeur: string): string {
  return CATEGORIES.find((c) => c.valeur === valeur)?.libelle ?? valeur;
}

export function libelleUnite(valeur: string): string {
  return UNITES.find((u) => u.valeur === valeur)?.libelle ?? valeur;
}

export function libelleEtat(valeur: string): string {
  return ETATS_MARCHANDISE.find((e) => e.valeur === valeur)?.libelle ?? valeur;
}

export function formaterPrix(prix: number | null, devise: string): string {
  if (prix === null) return "Prix sur demande";
  return `${prix.toLocaleString("fr-FR")} ${devise}`;
}

export function badgeStatutMarchandise(statut: string): {
  texte: string;
  classe: string;
} {
  switch (statut) {
    case "publiee":
      return { texte: "Publiée", classe: "border-accent text-accent" };
    case "brouillon":
      return { texte: "Brouillon", classe: "border-line text-muted" };
    case "vendue":
      return { texte: "Vendue", classe: "border-line text-parchment" };
    case "retiree":
      return { texte: "Retirée", classe: "border-red-800 text-red-400" };
    default:
      return { texte: statut, classe: "border-line text-muted" };
  }
}
