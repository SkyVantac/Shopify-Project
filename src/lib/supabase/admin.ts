import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// ⚠️ Ce client utilise la clé secrète et a tous les droits (il ignore les
// règles de sécurité RLS). Il ne doit JAMAIS être utilisé côté navigateur,
// uniquement dans du code serveur de confiance (ex: le webhook Stripe).
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
