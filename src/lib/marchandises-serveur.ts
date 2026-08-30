import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { estAdmin } from "@/lib/admin";

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

async function obtenirContexte() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { user, supabase, estUnAdmin: estAdmin(user?.email) };
}

// Marchandises publiées, visibles par le viewer courant.
//
// Un membre actif normal passe par le client authentifié : la policy
// RLS ("publiee" + vendeur actif + lecteur actif) filtre tout, seule
// source de vérité. Un admin n'est pas forcément "actif" au sens
// strict (il ne paie pas d'abonnement) — la RLS le bloquerait donc
// totalement. On reproduit alors manuellement, en code, exactement la
// même règle avec le client admin (même logique déjà utilisée pour la
// publication et l'upload de photos).
export async function recupererMarchandisesPubliees(): Promise<Marchandise[]> {
  const { user, supabase, estUnAdmin } = await obtenirContexte();
  if (!user) return [];

  if (estUnAdmin) {
    const admin = createAdminClient();
    const { data: vendeursActifs } = await admin
      .from("abonnes")
      .select("id")
      .eq("statut", "actif");

    const idsActifs = (vendeursActifs ?? []).map((v) => v.id);
    if (idsActifs.length === 0) return [];

    const { data } = await admin
      .from("marchandises")
      .select(COLONNES)
      .eq("statut", "publiee")
      .in("vendeur_id", idsActifs)
      .order("publiee_le", { ascending: false });

    return (data as Marchandise[] | null) ?? [];
  }

  const { data } = await supabase
    .from("marchandises")
    .select(COLONNES)
    .eq("statut", "publiee")
    .order("publiee_le", { ascending: false });

  return (data as Marchandise[] | null) ?? [];
}

// Une marchandise par id, avec la même règle de visibilité — sauf pour
// son propre vendeur, qui peut toujours voir sa propre annonce (y
// compris un brouillon).
export async function recupererMarchandiseParId(
  id: string
): Promise<Marchandise | null> {
  const { user, supabase, estUnAdmin } = await obtenirContexte();
  if (!user) return null;

  const admin = estUnAdmin ? createAdminClient() : null;
  const client = admin ?? supabase;

  const { data } = await client
    .from("marchandises")
    .select(COLONNES)
    .eq("id", id)
    .maybeSingle();

  if (!data) return null;
  const marchandise = data as Marchandise;

  if (marchandise.vendeur_id === user.id) {
    return marchandise;
  }

  if (admin) {
    // Le client admin contourne la RLS : on revalide donc manuellement
    // la même règle (publiée + vendeur actif) pour un admin qui
    // consulte l'annonce de quelqu'un d'autre.
    if (marchandise.statut !== "publiee") return null;

    const { data: vendeur } = await admin
      .from("abonnes")
      .select("statut")
      .eq("id", marchandise.vendeur_id)
      .maybeSingle();

    if (vendeur?.statut !== "actif") return null;
  }
  // Sinon (client authentifié normal), la RLS a déjà fait ce travail :
  // si la ligne est revenue, elle est visible.

  return marchandise;
}

// Les annonces du vendeur connecté, tous statuts confondus. La policy
// "un vendeur voit ses propres marchandises" n'a aucune condition
// d'actif — elle marche donc identiquement pour un admin ou un membre
// actif, via le client authentifié, sans logique particulière.
export async function recupererMesMarchandises(): Promise<Marchandise[]> {
  const { user, supabase } = await obtenirContexte();
  if (!user) return [];

  const { data } = await supabase
    .from("marchandises")
    .select(COLONNES)
    .eq("vendeur_id", user.id)
    .order("created_at", { ascending: false });

  return (data as Marchandise[] | null) ?? [];
}

// URL signée pour une photo du bucket privé marchandises-photos.
// Même logique admin/actif que pour les données : le bucket a une
// policy de lecture qui exige le même contexte "lecteur actif".
export async function genererUrlSigneePhoto(
  chemin: string
): Promise<string | null> {
  const { supabase, estUnAdmin } = await obtenirContexte();
  const client = estUnAdmin ? createAdminClient() : supabase;

  const { data } = await client.storage
    .from("marchandises-photos")
    .createSignedUrl(chemin, 3600);

  return data?.signedUrl ?? null;
}
