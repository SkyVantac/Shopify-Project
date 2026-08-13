-- ============================================================
-- SKY VANTAC — Brique 1 : inscription + paiement + accès membre
-- À copier-coller dans Supabase -> SQL Editor -> "New query" -> Run
-- ============================================================

-- Table qui garde en mémoire, pour chaque compte, si l'abonnement
-- a été payé ou non. Le statut ne peut être changé QUE par le
-- serveur (via la clé secrète), jamais par l'utilisateur lui-même.
create table if not exists public.abonnes (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  statut text not null default 'en_attente' check (statut in ('en_attente', 'actif', 'annule')),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.abonnes enable row level security;

-- Un utilisateur connecté peut UNIQUEMENT lire sa propre ligne.
-- Il n'y a volontairement aucune règle d'écriture pour les utilisateurs :
-- seule la clé secrète (utilisée par le webhook Stripe côté serveur)
-- peut modifier cette table.
drop policy if exists "Un utilisateur voit son propre statut" on public.abonnes;
create policy "Un utilisateur voit son propre statut"
  on public.abonnes
  for select
  using (auth.uid() = id);

-- Quand quelqu'un crée un compte (inscription), on crée automatiquement
-- sa ligne dans "abonnes" avec le statut "en_attente".
create or replace function public.gerer_nouvel_utilisateur()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.abonnes (id, email, statut)
  values (new.id, new.email, 'en_attente');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.gerer_nouvel_utilisateur();

-- Petit trigger pratique pour tenir "updated_at" à jour.
create or replace function public.gerer_maj_abonnes()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_abonnes_updated on public.abonnes;
create trigger on_abonnes_updated
  before update on public.abonnes
  for each row execute procedure public.gerer_maj_abonnes();
