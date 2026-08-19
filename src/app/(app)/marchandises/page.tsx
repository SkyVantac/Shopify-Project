export default function MarchandisesPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Marchandises</h1>

      <div className="mt-6 flex flex-col gap-6 md:flex-row">
        <aside className="w-full shrink-0 rounded-2xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-400 md:w-56">
          Filtres
          <span className="mt-1 block text-xs text-zinc-400">
            Bientôt disponibles
          </span>
        </aside>

        <div className="flex-1 rounded-2xl border border-zinc-200 bg-white p-10 text-center">
          <p className="text-sm text-zinc-500">
            Aucune marchandise publiée pour l&apos;instant.
          </p>
        </div>
      </div>
    </main>
  );
}
