import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Client utilisé dans les Server Components / API routes.
// Il lit la session de l'utilisateur connecté via les cookies.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Appelé depuis un Server Component : on peut ignorer,
            // le middleware se charge de rafraîchir la session.
          }
        },
      },
    }
  );
}
