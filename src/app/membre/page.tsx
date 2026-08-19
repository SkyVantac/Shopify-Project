import { redirect } from "next/navigation";

// /membre a été remplacé par /accueil (Brique 3, header + navigation
// commune). On garde cette redirection pour ne pas casser d'anciens liens.
export default function MembrePage() {
  redirect("/accueil");
}
