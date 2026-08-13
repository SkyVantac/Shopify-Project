import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

// C'est le SEUL endroit du site qui a le droit de faire passer un
// abonné de "en_attente" à "actif". L'accès ne s'ouvre donc jamais
// juste parce qu'un visiteur revient sur le site après avoir payé :
// il s'ouvre uniquement quand Stripe confirme ici, par ce webhook,
// que le paiement a bien été effectué.
export async function POST(request: Request) {
  const corpsBrut = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ erreur: "Signature manquante" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      corpsBrut,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json(
      { erreur: `Signature invalide : ${message}` },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id ?? session.metadata?.supabase_user_id;

      if (userId) {
        await admin
          .from("abonnes")
          .update({
            statut: "actif",
            stripe_customer_id:
              typeof session.customer === "string" ? session.customer : null,
            stripe_subscription_id:
              typeof session.subscription === "string"
                ? session.subscription
                : null,
          })
          .eq("id", userId);
      }
      break;
    }

    // L'abonnement s'arrête (annulation, échec de paiement final...) :
    // on referme l'accès.
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await admin
        .from("abonnes")
        .update({ statut: "annule" })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ recu: true });
}
