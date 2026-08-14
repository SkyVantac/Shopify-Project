import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// ⚠️ Ce client utilise la clé secrète et a tous les droits (il ignore les
// règles de sécurité RLS). Il ne doit JAMAIS être utilisé côté navigateur,
// uniquement dans du code serveur de confiance (ex: le webhook Stripe).
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      `Variables Supabase manquantes côté serveur (NEXT_PUBLIC_SUPABASE_URL: ${
        url ? "ok" : "MANQUANTE"
      }, SUPABASE_SECRET_KEY: ${
        secretKey ? "ok" : "MANQUANTE"
      }). Vérifie les noms exacts dans Vercel -> Settings -> Environment Variables.`
    );
  }

  return createSupabaseClient(
    url,
    secretKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
