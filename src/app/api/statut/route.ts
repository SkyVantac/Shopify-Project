import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ statut: null }, { status: 401 });
  }

  const { data: abonne } = await supabase
    .from("abonnes")
    .select("statut")
    .eq("id", user.id)
    .maybeSingle();

  return NextResponse.json({ statut: abonne?.statut ?? "en_attente" });
}
