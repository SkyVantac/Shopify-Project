type CarteVideProps = {
  titre: string;
  message: string;
};

export default function CarteVide({ titre, message }: CarteVideProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h2 className="text-sm font-semibold text-zinc-900">{titre}</h2>
      <p className="mt-2 text-sm text-zinc-500">{message}</p>
    </div>
  );
}
