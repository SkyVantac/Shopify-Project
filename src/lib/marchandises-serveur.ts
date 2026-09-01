import { createClient } from "@/lib/supabase/server";

export type Marchandise = {
  id: string;
  vendeur_id: string;
  titre: string;
  description: string;
  categorie: string;
  etat_marchandise: string | null;
  quantite: number;
  unite: string;
  prix: number | null;
  devise: string;
  pays: string;
  ville: string | null;
  photos: string[];
  statut: "brouillon" | "publiee" | "vendue" | "retiree";
  publiee_le: string | null;
  created_at: string;
  updated_at: string;
};

const COLONNES =
  "id, vendeur_id, titre, description, categorie, etat_marchandise, quantite, unite, prix, devise, pays, ville, photos, statut, publiee_le, created_at, updated_at";

// Marchandises publiées, visibles par le viewer courant. La policy RLS
// ("publiee" + vendeur actif-ou-admin + lecteur actif-ou-admin, voir
// migration-06-admins.sql) fait tout le travail — plus besoin de
// distinguer admin/membre actif en code, ni de reproduire la règle
// manuellement avec un client différent.
export async function recupererMarchandisesPubliees(): Promise<Marchandise[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("marchandises")
    .select(COLONNES)
    .eq("statut", "publiee")
    .order("publiee_le", { ascending: false });

  return (data as Marchandise[] | null) ?? [];
}

// Une marchandise par id. Même principe : la RLS distingue déjà "c'est
// ma propre annonce" (toujours visible, brouillon inclus) de "annonce
// publiée d'un vendeur actif-ou-admin, consultée par un lecteur
// actif-ou-admin".
export async function recupererMarchandiseParId(
  id: string
): Promise<Marchandise | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("marchandises")
    .select(COLONNES)
    .eq("id", id)
    .maybeSingle();

  return (data as Marchandise | null) ?? null;
}

// Les annonces du vendeur connecté, tous statuts confondus.
export async function recupererMesMarchandises(): Promise<Marchandise[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("marchandises")
    .select(COLONNES)
    .eq("vendeur_id", user.id)
    .order("created_at", { ascending: false });

  return (data as Marchandise[] | null) ?? [];
}

// URL signée pour une photo du bucket privé marchandises-photos.
export async function genererUrlSigneePhoto(
  chemin: string
): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.storage
    .from("marchandises-photos")
    .createSignedUrl(chemin, 3600);

  return data?.signedUrl ?? null;
}
