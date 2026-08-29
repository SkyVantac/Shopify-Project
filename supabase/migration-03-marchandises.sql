-- ============================================================
-- SKY VANTAC — Brique 4 : table des marchandises
-- À copier-coller dans Supabase -> SQL Editor -> "New query" -> Run
-- (à exécuter APRÈS schema.sql et migration-02-admission.sql)
-- ============================================================

create table if not exists public.marchandises (
  id uuid primary key default gen_random_uuid(),

  -- Qui publie. Jamais modifiable après création (pas de policy UPDATE
  -- qui autorise à changer cette colonne côté client).
  vendeur_id uuid not null references public.abonnes (id) on delete cascade,

  titre text not null,
  description text not null,

  -- Slug : Libellé affiché dans l'app
  --   electronique_hightech        : Électronique & high-tech
  --   electromenager_maison        : Électroménager & maison
  --   textile_mode_accessoires     : Textile, mode & accessoires
  --   beaute_cosmetique_parfumerie : Beauté, cosmétique & parfumerie
  --   alimentaire_boissons         : Alimentaire & boissons
  --   sante_hygiene_parapharmacie  : Santé, hygiène & parapharmacie
  --   jouets_puericulture_loisirs  : Jouets, puériculture & loisirs
  --   bricolage_outillage_industrie: Bricolage, outillage & industrie
  --   auto_moto_pieces             : Auto, moto & pièces
  --   sport_plein_air              : Sport & plein air
  --   matieres_premieres_emballage : Matières premières & emballage
  --   lots_multi_categories        : Lots multi-catégories / déstockage mixte
  --   autre                        : Autre
  categorie text not null check (categorie in (
    'electronique_hightech',
    'electromenager_maison',
    'textile_mode_accessoires',
    'beaute_cosmetique_parfumerie',
    'alimentaire_boissons',
    'sante_hygiene_parapharmacie',
    'jouets_puericulture_loisirs',
    'bricolage_outillage_industrie',
    'auto_moto_pieces',
    'sport_plein_air',
    'matieres_premieres_emballage',
    'lots_multi_categories',
    'autre'
  )),

  -- Optionnel : pas toujours pertinent selon la marchandise.
  etat_marchandise text check (etat_marchandise in (
    'neuf', 'reconditionne', 'surplus_destockage', 'occasion'
  )),

  quantite numeric not null check (quantite > 0),
  unite text not null check (unite in (
    'pieces', 'kg', 'tonnes', 'palettes', 'conteneurs', 'cartons'
  )),

  -- Optionnel : NULL = "Prix sur demande" côté affichage.
  prix numeric check (prix is null or prix > 0),
  devise text not null default 'EUR' check (devise in ('EUR', 'USD', 'GBP', 'CHF')),

  pays text not null,
  ville text,

  -- Chemins dans le bucket Storage privé, pas des URLs publiques.
  photos text[] not null default '{}'::text[],

  statut text not null default 'brouillon' check (statut in (
    'brouillon', 'publiee', 'vendue', 'retiree'
  )),

  publiee_le timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marchandises_vendeur_id_idx on public.marchandises (vendeur_id);
create index if not exists marchandises_statut_idx on public.marchandises (statut);

alter table public.marchandises enable row level security;

-- Un membre ACTIF voit une marchandise PUBLIÉE, uniquement si le
-- vendeur est LUI AUSSI actif (masquage réversible : dès que le
-- vendeur redevient actif, ses annonces publiées se réaffichent
-- automatiquement, sans rien avoir touché en base).
drop policy if exists "Marchandises publiees visibles par les membres actifs" on public.marchandises;
create policy "Marchandises publiees visibles par les membres actifs"
  on public.marchandises
  for select
  using (
    statut = 'publiee'
    and exists (
      select 1 from public.abonnes vendeur
      where vendeur.id = marchandises.vendeur_id
        and vendeur.statut = 'actif'
    )
    and exists (
      select 1 from public.abonnes lecteur
      where lecteur.id = auth.uid()
        and lecteur.statut = 'actif'
    )
  );

-- Un vendeur voit TOUJOURS ses propres marchandises (brouillons inclus,
-- et même si son abonnement n'est plus actif).
drop policy if exists "Un vendeur voit ses propres marchandises" on public.marchandises;
create policy "Un vendeur voit ses propres marchandises"
  on public.marchandises
  for select
  using (auth.uid() = vendeur_id);

-- Seul un membre actif peut publier, et uniquement en son propre nom.
drop policy if exists "Un membre actif peut publier une marchandise" on public.marchandises;
create policy "Un membre actif peut publier une marchandise"
  on public.marchandises
  for insert
  with check (
    auth.uid() = vendeur_id
    and exists (
      select 1 from public.abonnes
      where abonnes.id = auth.uid() and abonnes.statut = 'actif'
    )
  );

-- Un vendeur modifie uniquement ses propres marchandises (y compris
-- pour les retirer en passant statut à 'retiree').
drop policy if exists "Un vendeur modifie ses propres marchandises" on public.marchandises;
create policy "Un vendeur modifie ses propres marchandises"
  on public.marchandises
  for update
  using (auth.uid() = vendeur_id)
  with check (auth.uid() = vendeur_id);

-- Volontairement AUCUNE policy DELETE : on ne supprime jamais une
-- marchandise, on passe son statut à 'retiree' (évite de casser une
-- future conversation qui y ferait référence).

-- Renseigne automatiquement publiee_le au premier passage à "publiee",
-- et tient updated_at à jour (même pattern que la table abonnes).
create or replace function public.gerer_maj_marchandises()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  if new.statut = 'publiee' and old.statut is distinct from 'publiee' and new.publiee_le is null then
    new.publiee_le = now();
  end if;
  return new;
end;
$$;

drop trigger if exists on_marchandises_updated on public.marchandises;
create trigger on_marchandises_updated
  before update on public.marchandises
  for each row execute procedure public.gerer_maj_marchandises();
