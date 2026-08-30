import {
  recupererMarchandisesPubliees,
  genererUrlSigneePhoto,
} from "@/lib/marchandises-serveur";
import CarteMarchandise from "@/components/carte-marchandise";

export default async function MarchandisesPage() {
  const marchandises = await recupererMarchandisesPubliees();

  const cartes = await Promise.all(
    marchandises.map(async (marchandise) => ({
      marchandise,
      photoUrl: marchandise.photos[0]
        ? await genererUrlSigneePhoto(marchandise.photos[0])
        : null,
    }))
  );

  return (
    <main className="flex-1 bg-ink px-6 py-10 text-parchment">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="font-playfair text-2xl font-semibold tracking-[.07em]">
          Marchandises
        </h1>

        <div className="mt-6 flex flex-col gap-6 md:flex-row">
          <aside className="w-full shrink-0 rounded-card border border-dashed border-line p-4 text-sm text-dim md:w-56">
            Filtres
            <span className="mt-1 block text-xs text-dim">
              Bientôt disponibles
            </span>
          </aside>

          <div className="flex-1">
            {cartes.length === 0 ? (
              <div className="rounded-card border border-line bg-ink-2 p-10 text-center">
                <p className="text-sm text-muted">
                  Aucune marchandise publiée pour l&apos;instant.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cartes.map(({ marchandise, photoUrl }) => (
                  <CarteMarchandise
                    key={marchandise.id}
                    marchandise={marchandise}
                    photoUrl={photoUrl}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
