import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { estAdmin } from "@/lib/admin";

// Garde la session Supabase à jour à chaque requête, et bloque l'accès
// aux pages protégées si l'utilisateur n'est pas connecté.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Toutes les pages de l'espace connecté (header + navigation commune,
  // Brique 3), plus /membre qui redirige désormais vers /accueil.
  const routesProtegees = [
    "/accueil",
    "/marchandises",
    "/recherches",
    "/messages",
    "/mon-espace",
    "/membre",
  ];
  const isProtectedRoute = routesProtegees.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  if ((isProtectedRoute || isAdminRoute) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/connexion";
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && user && !estAdmin(user.email)) {
    const accueilUrl = request.nextUrl.clone();
    accueilUrl.pathname = "/";
    return NextResponse.redirect(accueilUrl);
  }

  if (isProtectedRoute && user) {
    // L'accès n'est jamais accordé juste parce que l'utilisateur revient sur
    // le site : on relit à chaque fois le statut stocké en base, qui n'est
    // modifié que par le webhook Stripe une fois le paiement confirmé.
    const { data: abonne } = await supabase
      .from("abonnes")
      .select("statut")
      .eq("id", user.id)
      .maybeSingle();

    if (abonne?.statut !== "actif") {
      const pendingUrl = request.nextUrl.clone();
      pendingUrl.pathname = "/paiement-en-attente";
      return NextResponse.redirect(pendingUrl);
    }
  }

  return response;
}
