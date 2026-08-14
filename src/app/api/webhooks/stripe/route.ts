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

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    console.error("[webhook stripe] configuration Supabase invalide:", message);
    return NextResponse.json({ erreur: message }, { status: 500 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id ?? session.metadata?.supabase_user_id;

      if (!userId) {
        console.error(
          "[webhook stripe] checkout.session.completed sans client_reference_id ni metadata.supabase_user_id",
          { sessionId: session.id }
        );
        return NextResponse.json(
          { erreur: "Session Stripe sans identifiant utilisateur." },
          { status: 400 }
        );
      }

      const { data, error } = await admin
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
        .eq("id", userId)
        .select("id");

      if (error) {
        // On logue l'erreur ET on la renvoie dans la réponse : elle sera
        // visible directement dans Stripe -> Développeurs -> Webhooks ->
        // (ton endpoint) -> historique des tentatives.
        console.error("[webhook stripe] échec de la mise à jour Supabase", error);
        return NextResponse.json(
          { erreur: `Supabase: ${error.message}` },
          { status: 500 }
        );
      }

      if (!data || data.length === 0) {
        // La requête a réussi mais n'a modifié aucune ligne : soit la
        // ligne "abonnes" pour cet utilisateur n'existe pas (le trigger
        // d'inscription n'a pas tourné), soit l'id ne correspond à rien.
        console.error(
          "[webhook stripe] aucune ligne 'abonnes' mise à jour pour userId=",
          userId
        );
        return NextResponse.json(
          {
            erreur: `Aucun abonné trouvé avec id=${userId} dans la table "abonnes".`,
          },
          { status: 500 }
        );
      }
      break;
    }

    // L'abonnement s'arrête (annulation, échec de paiement final...) :
    // on referme l'accès.
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const { error } = await admin
        .from("abonnes")
        .update({ statut: "annule" })
        .eq("stripe_subscription_id", subscription.id);

      if (error) {
        console.error("[webhook stripe] échec de l'annulation Supabase", error);
        return NextResponse.json(
          { erreur: `Supabase: ${error.message}` },
          { status: 500 }
        );
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ recu: true });
}
