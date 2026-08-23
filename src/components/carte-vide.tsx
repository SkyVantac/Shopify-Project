type CarteVideProps = {
  titre: string;
  message: string;
};

export default function CarteVide({ titre, message }: CarteVideProps) {
  return (
    <div className="rounded-card border border-line bg-ink-2 p-6">
      <h2 className="font-playfair text-sm font-semibold tracking-[.14em] text-parchment uppercase">
        {titre}
      </h2>
      <p className="mt-2 text-sm text-dim">{message}</p>
    </div>
  );
}
