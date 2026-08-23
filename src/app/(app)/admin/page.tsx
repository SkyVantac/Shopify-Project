import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { estAdmin } from "@/lib/admin";
import { validerCandidature, refuserCandidature } from "./actions";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !estAdmin(user.email)) {
    redirect("/");
  }

  // On utilise la clé secrète ici : un admin doit voir TOUTES les
  // candidatures, pas seulement la sienne (la policy RLS normale ne
  // permet à chacun de voir que sa propre ligne).
  const admin = createAdminClient();
  const { data: enRevue } = await admin
    .from("abonnes")
    .select("id, email, paye_le, created_at")
    .eq("statut", "en_revue")
    .order("paye_le", { ascending: true });

  const { data: recentes } = await admin
    .from("abonnes")
    .select("id, email, statut, paye_le")
    .in("statut", ["actif", "refuse"])
    .order("updated_at", { ascending: false })
    .limit(20);

  return (
    <main className="flex-1 bg-ink px-6 py-16 text-parchment">
      <div className="mx-auto flex w-full max-w-3xl flex-col">
        <h1 className="font-playfair text-2xl font-semibold tracking-[.07em]">
          Admin — Candidatures
        </h1>
        <p className="mt-2 text-sm text-muted">
          Connecté en tant que {user.email}.
        </p>

        <section className="mt-10">
          <h2 className="font-playfair text-lg font-medium tracking-[.07em]">
            En attente de validation ({enRevue?.length ?? 0})
          </h2>

          {!enRevue || enRevue.length === 0 ? (
            <p className="mt-4 text-sm text-muted">
              Aucune candidature en attente pour le moment.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line rounded-card border border-line bg-ink-2">
              {enRevue.map((candidat) => (
                <li
                  key={candidat.id}
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-parchment">{candidat.email}</p>
                    <p className="text-sm text-muted">
                      Payé le {formatDate(candidat.paye_le)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <form action={validerCandidature.bind(null, candidat.id)}>
                      <button
                        type="submit"
                        className="rounded-brand bg-accent px-5 py-2 text-sm font-semibold text-ink hover:bg-accent-2"
                      >
                        Valider
                      </button>
                    </form>
                    <form action={refuserCandidature.bind(null, candidat.id)}>
                      <button
                        type="submit"
                        className="rounded-brand border border-red-800 px-5 py-2 text-sm font-medium text-red-400 hover:bg-red-950/40"
                      >
                        Refuser
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-12">
          <h2 className="font-playfair text-lg font-medium tracking-[.07em]">
            Décisions récentes
          </h2>
          {!recentes || recentes.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Rien pour l&apos;instant.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line rounded-card border border-line bg-ink-2">
              {recentes.map((candidat) => (
                <li
                  key={candidat.id}
                  className="flex items-center justify-between px-4 py-3 text-sm"
                >
                  <span className="text-parchment">{candidat.email}</span>
                  <span
                    className={
                      candidat.statut === "actif"
                        ? "font-medium text-accent"
                        : "font-medium text-red-400"
                    }
                  >
                    {candidat.statut === "actif" ? "Validé" : "Refusé"}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-dim">
            Un refus n&apos;annule pas automatiquement le paiement : pense à
            rembourser toi-même depuis le Dashboard Stripe (Paiements → trouve
            le client par son e-mail → Rembourser).
          </p>
        </section>
      </div>
    </main>
  );
}
