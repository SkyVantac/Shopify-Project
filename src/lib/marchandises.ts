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
