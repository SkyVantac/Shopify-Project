"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DeconnexionBouton() {
  const router = useRouter();

  async function handleClick() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      className="rounded-full border border-zinc-300 px-6 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-100"
    >
      Se déconnecter
    </button>
  );
}
