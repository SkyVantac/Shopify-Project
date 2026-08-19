export default function MessagesPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-10 text-center">
        <p className="text-sm text-zinc-500">
          Aucune conversation pour l&apos;instant. Une conversation ne
          s&apos;ouvre qu&apos;autour d&apos;une marchandise.
        </p>
      </div>
    </main>
  );
}
