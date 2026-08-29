-- ============================================================
-- SKY VANTAC — Brique 4 : registre des empreintes de photos
-- À copier-coller dans Supabase -> SQL Editor -> "New query" -> Run
-- (à exécuter APRÈS schema.sql, migration-02-admission.sql et
--  migration-03-marchandises.sql)
-- ============================================================

-- Une ligne par photo publiée, avec son empreinte (hash SHA-256 du
-- contenu du fichier). La contrainte UNIQUE sur "empreinte" empêche,
-- au niveau de la base elle-même, qu'une même image (peu importe le
-- vendeur) soit publiée deux fois — c'est le filet de sécurité final,
-- en plus de la vérification faite côté serveur avant l'upload.
create table if not exists public.marchandises_photos (
  id uuid primary key default gen_random_uuid(),
  marchandise_id uuid not null references public.marchandises (id) on delete cascade,
  vendeur_id uuid not null references public.abonnes (id) on delete cascade,
  chemin text not null,
  empreinte text not null,
  created_at timestamptz not null default now(),

  constraint marchandises_photos_empreinte_unique unique (empreinte)
);

create index if not exists marchandises_photos_marchandise_id_idx
  on public.marchandises_photos (marchandise_id);
create index if not exists marchandises_photos_empreinte_idx
  on public.marchandises_photos (empreinte);

alter table public.marchandises_photos enable row level security;

-- Volontairement AUCUNE policy : cette table n'est jamais lue ni écrite
-- directement depuis le navigateur. Toute vérification et écriture se
-- fait côté serveur avec la clé secrète (comme pour la validation
-- admin) — ça évite en plus qu'un vendeur puisse déduire, via une
-- requête RLS mal calibrée, ce qu'un autre vendeur a publié.
