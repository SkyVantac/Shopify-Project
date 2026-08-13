import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json(
      { erreur: "Tu dois être connecté pour payer l'abonnement." },
      { status: 401 }
    );
  }

  // Si ce client Stripe existe déjà (ex: il a démarré un paiement puis
  // annulé), on le réutilise au lieu d'en créer un nouveau à chaque fois.
  const admin = createAdminClient();
  const { data: abonne } = await admin
    .from("abonnes")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    customer: abonne?.stripe_customer_id ?? undefined,
    customer_email: abonne?.stripe_customer_id ? undefined : user.email,
    client_reference_id: user.id,
    metadata: { supabase_user_id: user.id },
    subscription_data: {
      metadata: { supabase_user_id: user.id },
    },
    success_url: `${siteUrl}/paiement-en-attente`,
    cancel_url: `${siteUrl}/inscription`,
  });

  if (!session.url) {
    return NextResponse.json(
      { erreur: "Impossible de créer la session de paiement." },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: session.url });
}
