import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="mb-4 text-sm font-medium uppercase tracking-widest text-zinc-500">
        Cercle privé B2B
      </p>
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
        SKY VANTAC
      </h1>
      <p className="mt-6 max-w-xl text-lg text-zinc-600">
        L&apos;accès réservé aux professionnels de l&apos;import/export.
        Abonnement annuel : <strong>1000&nbsp;€ / an</strong>.
      </p>
      <div className="mt-10 flex gap-4">
        <Link
          href="/inscription"
          className="rounded-full bg-zinc-900 px-8 py-3 text-base font-medium text-white transition-colors hover:bg-zinc-700"
        >
          Rejoindre le cercle
        </Link>
        <Link
          href="/connexion"
          className="rounded-full border border-zinc-300 px-8 py-3 text-base font-medium text-zinc-900 transition-colors hover:bg-zinc-100"
        >
          J&apos;ai déjà un compte
        </Link>
      </div>
    </main>
  );
}
