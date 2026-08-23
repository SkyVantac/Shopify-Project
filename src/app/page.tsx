import Link from "next/link";
import LogoMeridien from "@/components/logo-meridien";

export default function Home() {
  return (
    <main
      className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center"
      style={{
        background:
          "radial-gradient(120% 80% at 50% -20%, #17263f 0%, #0B0F14 58%)",
      }}
    >
      <LogoMeridien size={40} className="mb-6" />
      <p className="mb-4 text-sm font-medium uppercase tracking-[.14em] text-muted">
        Cercle privé B2B
      </p>
      <h1 className="font-playfair max-w-2xl text-4xl font-semibold tracking-[.07em] text-parchment sm:text-5xl">
        SKY VANTAC
      </h1>
      <p className="mt-6 max-w-xl text-lg text-muted">
        L&apos;accès réservé aux professionnels de l&apos;import/export.
        Abonnement annuel : <strong className="text-parchment">1000&nbsp;€ / an</strong>.
      </p>
      <div className="mt-10 flex gap-4">
        <Link
          href="/inscription"
          className="rounded-brand bg-accent px-8 py-3 text-base font-semibold text-ink transition-colors hover:bg-accent-2"
        >
          Rejoindre le cercle
        </Link>
        <Link
          href="/connexion"
          className="rounded-brand border border-line px-8 py-3 text-base font-medium text-parchment transition-colors hover:border-accent"
        >
          J&apos;ai déjà un compte
        </Link>
      </div>
    </main>
  );
}
