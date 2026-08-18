import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { estAdmin } from "@/lib/admin";
import Header from "@/components/header";

// Layout commun à toutes les pages connectées (accueil, marchandises,
// recherches, messages, mon-espace) : header partagé + protection.
//
// Le middleware protège déjà ces routes, mais comme pour l'ancienne page
// /membre, on refait ici une deuxième vérification indépendante : on ne
// fait confiance qu'au statut stocké en base, jamais à l'URL ou à un état
// côté navigateur.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const { data: abonne } = await supabase
    .from("abonnes")
    .select("statut")
    .eq("id", user.id)
    .maybeSingle();

  if (abonne?.statut !== "actif") {
    redirect("/paiement-en-attente");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header
        emailUtilisateur={user.email ?? ""}
        estAdmin={estAdmin(user.email)}
      />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
