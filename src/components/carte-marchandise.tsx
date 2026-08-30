import Link from "next/link";
import type { Marchandise } from "@/lib/marchandises-serveur";
import { libelleCategorie, libelleUnite, formaterPrix } from "@/lib/marchandises";

type CarteMarchandiseProps = {
  marchandise: Marchandise;
  photoUrl: string | null;
};

export default function CarteMarchandise({
  marchandise,
  photoUrl,
}: CarteMarchandiseProps) {
  return (
    <Link
      href={`/marchandises/${marchandise.id}`}
      className="block overflow-hidden rounded-card border border-line bg-ink-2 transition-colors hover:border-accent"
    >
      <div className="aspect-[4/3] w-full bg-ink">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={marchandise.titre}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-dim">
            Pas de photo
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-[.1em] text-muted">
          {libelleCategorie(marchandise.categorie)}
        </p>
        <h3 className="font-playfair mt-1 text-lg font-semibold text-parchment">
          {marchandise.titre}
        </h3>
        <p className="mt-2 text-sm text-muted">
          {marchandise.quantite} {libelleUnite(marchandise.unite)} ·{" "}
          {marchandise.ville ? `${marchandise.ville}, ` : ""}
          {marchandise.pays}
        </p>
        <p className="mt-2 text-sm font-medium text-accent">
          {formaterPrix(marchandise.prix, marchandise.devise)}
        </p>
      </div>
    </Link>
  );
}
