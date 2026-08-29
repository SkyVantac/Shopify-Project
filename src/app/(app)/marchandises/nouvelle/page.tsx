"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ChampTexte from "@/components/champ-texte";
import ChampSelect from "@/components/champ-select";
import BoutonPrimaire from "@/components/bouton-primaire";
import { CATEGORIES, ETATS_MARCHANDISE, UNITES, DEVISES, MAX_PHOTOS } from "@/lib/marchandises";
import { creerMarchandise } from "./actions";

export default function NouvelleMarchandisePage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<File[]>([]);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  // Aperçus locaux uniquement — aucun hash n'est calculé côté client,
  // la détection de doublons se fait entièrement côté serveur.
  const apercus = useMemo(
    () => photos.map((fichier) => URL.createObjectURL(fichier)),
    [photos]
  );

  useEffect(() => {
    return () => {
      apercus.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [apercus]);

  function gererChoixPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const fichiers = Array.from(e.target.files ?? []);
    if (fichiers.length > MAX_PHOTOS) {
      setErreur(`Choisis au maximum ${MAX_PHOTOS} photos.`);
      setPhotos(fichiers.slice(0, MAX_PHOTOS));
      return;
    }
    setErreur(null);
    setPhotos(fichiers);
  }

  async function gererSoumission(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur(null);

    const formulaire = e.currentTarget;
    const submitter = (e.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null;
    const intention = submitter?.value === "publier" ? "publier" : "brouillon";

    setEnCours(true);

    const formData = new FormData(formulaire);
    formData.set("intention", intention);
    // Le champ natif garde tous les fichiers d'origine même après une
    // troncature côté état : on remplace par la liste réellement retenue.
    formData.delete("photos");
    photos.forEach((fichier) => formData.append("photos", fichier));

    try {
      const resultat = await creerMarchandise(formData);

      if (!resultat.succes) {
        setErreur(resultat.erreur);
        setEnCours(false);
        return;
      }

      router.push("/marchandises");
      router.refresh();
    } catch {
      setErreur("Une erreur inattendue est survenue. Réessaie dans un instant.");
      setEnCours(false);
    }
  }

  return (
    <main className="flex-1 bg-ink px-6 py-10 text-parchment">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="font-playfair text-2xl font-semibold tracking-[.07em]">
          Publier une marchandise
        </h1>

        <form onSubmit={gererSoumission} className="mt-8 flex flex-col gap-4">
          <ChampTexte id="titre" name="titre" label="Titre" required />

          <div>
            <label
              htmlFor="description"
              className="mb-1 block text-sm font-medium text-muted"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              className="w-full rounded-brand border border-line bg-ink px-4 py-2.5 text-parchment outline-none placeholder:text-dim focus:border-accent"
            />
          </div>

          <ChampSelect
            id="categorie"
            name="categorie"
            label="Catégorie"
            required
            placeholder="Choisir une catégorie"
            options={CATEGORIES}
          />

          <ChampSelect
            id="etatMarchandise"
            name="etatMarchandise"
            label="État de la marchandise (optionnel)"
            placeholder="Non précisé"
            options={ETATS_MARCHANDISE}
          />

          <div className="grid grid-cols-2 gap-4">
            <ChampTexte
              id="quantite"
              name="quantite"
              label="Quantité"
              type="number"
              min="0.01"
              step="any"
              required
            />
            <ChampSelect
              id="unite"
              name="unite"
              label="Unité"
              required
              placeholder="Choisir"
              options={UNITES}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ChampTexte
              id="prix"
              name="prix"
              label="Prix (optionnel — vide = sur demande)"
              type="number"
              min="0.01"
              step="any"
            />
            <ChampSelect
              id="devise"
              name="devise"
              label="Devise"
              options={DEVISES}
              defaultValue="EUR"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ChampTexte id="pays" name="pays" label="Pays" required />
            <ChampTexte id="ville" name="ville" label="Ville (optionnel)" />
          </div>

          <div>
            <label
              htmlFor="photos"
              className="mb-1 block text-sm font-medium text-muted"
            >
              Photos (optionnel, {MAX_PHOTOS} maximum)
            </label>
            <input
              id="photos"
              name="photos"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={gererChoixPhotos}
              className="w-full rounded-brand border border-line bg-ink px-4 py-2.5 text-sm text-parchment outline-none focus:border-accent"
            />
            {apercus.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {apercus.map((url, index) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={url}
                    src={url}
                    alt={`Aperçu ${index + 1}`}
                    className="h-20 w-20 rounded-brand border border-line object-cover"
                  />
                ))}
              </div>
            )}
          </div>

          {erreur && (
            <p className="rounded-brand border border-red-900 bg-red-950/40 px-4 py-2.5 text-sm text-red-300">
              {erreur}
            </p>
          )}

          <div className="mt-2 flex gap-3">
            <button
              type="submit"
              name="intention"
              value="brouillon"
              disabled={enCours}
              className="rounded-brand border border-line px-6 py-3 text-sm font-medium text-parchment transition-colors hover:border-accent disabled:opacity-50"
            >
              Enregistrer comme brouillon
            </button>
            <BoutonPrimaire
              type="submit"
              name="intention"
              value="publier"
              disabled={enCours}
              className="disabled:opacity-50"
            >
              {enCours ? "Un instant..." : "Publier"}
            </BoutonPrimaire>
          </div>
        </form>
      </div>
    </main>
  );
}
