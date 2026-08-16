"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { estAdmin } from "@/lib/admin";

async function verifierAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !estAdmin(user.email)) {
    throw new Error("Accès refusé.");
  }
}

export async function validerCandidature(abonneId: string) {
  await verifierAdmin();

  const admin = createAdminClient();
  const { error } = await admin
    .from("abonnes")
    .update({ statut: "actif" })
    .eq("id", abonneId)
    .eq("statut", "en_revue");

  if (error) {
    throw new Error(`Supabase: ${error.message}`);
  }

  revalidatePath("/admin");
}

export async function refuserCandidature(abonneId: string) {
  await verifierAdmin();

  const admin = createAdminClient();
  const { error } = await admin
    .from("abonnes")
    .update({ statut: "refuse" })
    .eq("id", abonneId)
    .eq("statut", "en_revue");

  if (error) {
    throw new Error(`Supabase: ${error.message}`);
  }

  revalidatePath("/admin");
}
