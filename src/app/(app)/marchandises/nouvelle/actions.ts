"use server";

import { createHash, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { estAdmin } from "@/lib/admin";
import {
  CATEGORIES,
  ETATS_MARCHANDISE,
  UNITES,
  DEVISES,
  MAX_PHOTOS,
} from "@/lib/marchandises";

const VALEURS_CATEGORIES = CATEGORIES.map((c) => c.valeur) as readonly string[];
const VALEURS_ETATS = ETATS_MARCHANDISE.map((e) => e.valeur) as readonly string[];
const VALEURS_UNITES = UNITES.map((u) => u.valeur) as readonly string[];
const VALEURS_DEVISES = DEVISES.map((d) => d.valeur) as readonly string[];

type ResultatPublication = { succes: true } | { succes: false; erreur: string };

export async function creerMarchandise(
  formData: FormData
): Promise<ResultatPublication> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { succes: false, erreur: "Tu dois être connecté." };
  }

  const admin = createAdminClient();
  const estUnAdmin = estAdmin(user.email);

  // Un admin ne paie pas d'abonnement (même règle que pour l'accès aux
  // pages membres) : il peut publier sans être "actif". Un membre
  // normal doit toujours l'être. On ne fait confiance qu'au statut
  // stocké en base, jamais à l'URL ou au fait que l'utilisateur ait
  // atteint cette page.
  const { data: abonne } = await admin
    .from("abonnes")
    .select("statut")
    .eq("id", user.id)
    .maybeSingle();

  if (!estUnAdmin && abonne?.statut !== "actif") {
    return {
      succes: false,
      erreur: "Ton abonnement doit être actif pour publier une marchandise.",
    };
  }

  const titre = String(formData.get("titre") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categorie = String(formData.get("categorie") ?? "");
  const etatMarchandiseBrut = String(formData.get("etatMarchandise") ?? "");
  const etatMarchandise = etatMarchandiseBrut || null;
  const quantiteBrute = String(formData.get("quantite") ?? "");
  const unite = String(formData.get("unite") ?? "");
  const prixBrut = String(formData.get("prix") ?? "");
  const devise = String(formData.get("devise") ?? "EUR");
  const pays = String(formData.get("pays") ?? "").trim();
  const villeBrute = String(formData.get("ville") ?? "").trim();
  const ville = villeBrute || null;
  const intention = String(formData.get("intention") ?? "brouillon");
  const statutCible = intention === "publier" ? "publiee" : "brouillon";

  if (!titre) {
    return { succes: false, erreur: "Le titre est obligatoire." };
  }
  if (!description) {
    return { succes: false, erreur: "La description est obligatoire." };
  }
  if (!VALEURS_CATEGORIES.includes(categorie)) {
    return { succes: false, erreur: "Choisis une catégorie valide." };
  }
  if (etatMarchandise && !VALEURS_ETATS.includes(etatMarchandise)) {
    return { succes: false, erreur: "État de la marchandise invalide." };
  }

  const quantite = Number(quantiteBrute);
  if (!Number.isFinite(quantite) || quantite <= 0) {
    return {
      succes: false,
      erreur: "La quantité doit être un nombre supérieur à 0.",
    };
  }
  if (!VALEURS_UNITES.includes(unite)) {
    return { succes: false, erreur: "Choisis une unité valide." };
  }

  let prix: number | null = null;
  if (prixBrut.trim()) {
    prix = Number(prixBrut);
    if (!Number.isFinite(prix) || prix <= 0) {
      return {
        succes: false,
        erreur: "Le prix doit être un nombre supérieur à 0, ou laissé vide.",
      };
    }
  }
  if (!VALEURS_DEVISES.includes(devise)) {
    return { succes: false, erreur: "Devise invalide." };
  }
  if (!pays) {
    return { succes: false, erreur: "Le pays est obligatoire." };
  }

  const photos = formData
    .getAll("photos")
    .filter((valeur): valeur is File => valeur instanceof File && valeur.size > 0);

  if (photos.length > MAX_PHOTOS) {
    return {
      succes: false,
      erreur: `${MAX_PHOTOS} photos maximum par annonce.`,
    };
  }

  // --- Détection de doublons : calcul des empreintes AVANT toute
  // création de ligne ou upload. Un doublon bloque tout, proprement. ---
  const empreintesDejaVues = new Map<string, string>();
  const photosAvecEmpreinte: { fichier: File; empreinte: string }[] = [];

  for (const fichier of photos) {
    const octets = Buffer.from(await fichier.arrayBuffer());
    const empreinte = createHash("sha256").update(octets).digest("hex");

    if (empreintesDejaVues.has(empreinte)) {
      return {
        succes: false,
        erreur: `L'image « ${fichier.name} » est un doublon d'une autre photo de cet envoi.`,
      };
    }
    empreintesDejaVues.set(empreinte, fichier.name);
    photosAvecEmpreinte.push({ fichier, empreinte });
  }

  if (photosAvecEmpreinte.length > 0) {
    const { data: existantes } = await admin
      .from("marchandises_photos")
      .select("empreinte")
      .in(
        "empreinte",
        photosAvecEmpreinte.map((p) => p.empreinte)
      );

    if (existantes && existantes.length > 0) {
      const empreintesExistantes = new Set(existantes.map((e) => e.empreinte));
      const doublon = photosAvecEmpreinte.find((p) =>
        empreintesExistantes.has(p.empreinte)
      );
      return {
        succes: false,
        erreur: `L'image « ${doublon?.fichier.name} » a déjà été publiée sur SKY VANTAC. Chaque annonce doit avoir ses propres photos — remplace cette image et réessaie.`,
      };
    }
  }

  // --- Aucun doublon : on crée la marchandise. ---
  const { data: marchandise, error: erreurCreation } = await admin
    .from("marchandises")
    .insert({
      vendeur_id: user.id,
      titre,
      description,
      categorie,
      etat_marchandise: etatMarchandise,
      quantite,
      unite,
      prix,
      devise,
      pays,
      ville,
      statut: statutCible,
    })
    .select("id")
    .single();

  if (erreurCreation || !marchandise) {
    return {
      succes: false,
      erreur: `Impossible de créer l'annonce : ${
        erreurCreation?.message ?? "erreur inconnue"
      }.`,
    };
  }

  // --- Upload des photos + registre des empreintes. ---
  //
  // Les policies du bucket marchandises-photos gèrent directement
  // "actif OU admin" (migration-06-admins.sql) : le client authentifié
  // suffit pour tout le monde, plus besoin de choisir un client
  // différent selon le rôle de l'utilisateur.
  const cheminsPhotos: string[] = [];

  for (const { fichier, empreinte } of photosAvecEmpreinte) {
    const extension = fichier.name.split(".").pop() ?? "jpg";
    const chemin = `${user.id}/${marchandise.id}/${randomUUID()}.${extension}`;

    const { error: erreurUpload } = await supabase.storage
      .from("marchandises-photos")
      .upload(chemin, fichier);

    if (erreurUpload) {
      // On ne bloque pas toute l'annonce pour une seule photo qui a
      // échoué à l'upload : on continue avec les autres.
      continue;
    }

    const { error: erreurRegistre } = await admin
      .from("marchandises_photos")
      .insert({
        marchandise_id: marchandise.id,
        vendeur_id: user.id,
        chemin,
        empreinte,
      });

    if (erreurRegistre) {
      // Collision rare : deux envois strictement simultanés de la même
      // image. La contrainte UNIQUE a bloqué l'insertion en base — on
      // nettoie le fichier tout juste uploadé et on prévient l'utilisateur.
      await supabase.storage.from("marchandises-photos").remove([chemin]);
      return {
        succes: false,
        erreur: `L'image « ${fichier.name} » vient d'être publiée par quelqu'un d'autre à l'instant. Remplace cette image et réessaie.`,
      };
    }

    cheminsPhotos.push(chemin);
  }

  if (cheminsPhotos.length > 0) {
    await admin
      .from("marchandises")
      .update({ photos: cheminsPhotos })
      .eq("id", marchandise.id);
  }

  revalidatePath("/marchandises");
  revalidatePath("/mon-espace");

  return { succes: true };
}
