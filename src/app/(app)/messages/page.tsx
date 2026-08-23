export default function MessagesPage() {
  return (
    <main className="flex-1 bg-ink px-6 py-10 text-parchment">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="font-playfair text-2xl font-semibold tracking-[.07em]">
          Messages
        </h1>

        <div className="mt-6 rounded-card border border-line bg-ink-2 p-10 text-center">
          <p className="text-sm text-muted">
            Aucune conversation pour l&apos;instant. Une conversation ne
            s&apos;ouvre qu&apos;autour d&apos;une marchandise.
          </p>
        </div>
      </div>
    </main>
  );
}
