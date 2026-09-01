-- ============================================================
-- SKY VANTAC — table admins + unification de la règle "actif OU admin"
-- À copier-coller dans Supabase -> SQL Editor -> "New query" -> Run
-- (à exécuter APRÈS toutes les migrations précédentes)
-- ============================================================

-- ------------------------------------------------------------
-- 1. Table admins : la contrepartie, côté base, de ADMIN_EMAILS
-- ------------------------------------------------------------
-- ADMIN_EMAILS (variable d'environnement) reste la source de vérité
-- côté app (middleware, header). Cette table est sa contrepartie côté
-- base : elle permet aux policies RLS d'exprimer "actif OU admin",
-- ce qu'elles ne pouvaient pas faire jusqu'ici (une policy ne peut pas
-- lire une variable d'environnement Next.js). Comme
-- marchandises_photos : RLS activée, AUCUNE policy — accès
-- exclusivement côté serveur, jamais depuis le navigateur.
create table if not exists public.admins (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

grant select, insert, update, delete on public.admins to service_role;

-- Nécessaire même sans policy directe : d'autres policies (plus bas)
-- référencent "admins" dans une sous-requête EXISTS, évaluée avec les
-- droits du rôle courant (authenticated). Sans ce GRANT, ces
-- sous-requêtes échoueraient avec "permission denied for table admins"
-- — exactement le bug qu'on vient de corriger sur marchandises.
grant select on public.admins to authenticated;

insert into public.admins (id, email)
select id, email from auth.users where email = 'admissions@skyvantac.com'
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 2. Policies marchandises : "actif" devient "actif OU admin"
-- ------------------------------------------------------------
-- Autre chose découverte en écrivant ceci : le côté VENDEUR de la
-- policy de lecture exigeait aussi "vendeur.statut = 'actif'". Comme
-- l'admin n'est pas actif au sens strict, ses propres annonces
-- publiées seraient restées invisibles pour TOUT LE MONDE (pas
-- seulement pour lui) — un deuxième bug caché derrière le premier,
-- jamais remarqué parce que les tests se faisaient avec le même
-- compte admin des deux côtés. Corrigé ici aussi.

drop policy if exists "Marchandises publiees visibles par les membres actifs" on public.marchandises;
create policy "Marchandises publiees visibles par les membres actifs"
  on public.marchandises
  for select
  using (
    statut = 'publiee'
    and (
      exists (
        select 1 from public.abonnes vendeur
        where vendeur.id = marchandises.vendeur_id
          and vendeur.statut = 'actif'
      )
      or exists (
        select 1 from public.admins
        where admins.id = marchandises.vendeur_id
      )
    )
    and (
      exists (
        select 1 from public.abonnes lecteur
        where lecteur.id = auth.uid()
          and lecteur.statut = 'actif'
      )
      or exists (
        select 1 from public.admins
        where admins.id = auth.uid()
      )
    )
  );

drop policy if exists "Un membre actif peut publier une marchandise" on public.marchandises;
create policy "Un membre actif peut publier une marchandise"
  on public.marchandises
  for insert
  with check (
    auth.uid() = vendeur_id
    and (
      exists (
        select 1 from public.abonnes
        where abonnes.id = auth.uid() and abonnes.statut = 'actif'
      )
      or exists (
        select 1 from public.admins
        where admins.id = auth.uid()
      )
    )
  );

-- (Les policies "un vendeur voit/modifie ses propres marchandises" et
-- la contrainte d'unicité des empreintes ne dépendent pas de "actif" :
-- rien à changer là.)

-- ------------------------------------------------------------
-- 3. Policies du bucket Storage marchandises-photos
-- ------------------------------------------------------------
-- Remplace les 2 policies créées via l'interface Storage (mêmes noms
-- exacts qu'à la création). La policy de suppression ne dépend pas de
-- "actif" : inchangée, pas besoin d'y toucher.

drop policy if exists "Upload photo par le vendeur actif" on storage.objects;
create policy "Upload photo par le vendeur actif"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'marchandises-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
    and (
      exists (
        select 1 from public.abonnes
        where abonnes.id = auth.uid() and abonnes.statut = 'actif'
      )
      or exists (
        select 1 from public.admins
        where admins.id = auth.uid()
      )
    )
  );

drop policy if exists "Photos visibles proprietaire ou marchandise publiee" on storage.objects;
create policy "Photos visibles proprietaire ou marchandise publiee"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'marchandises-photos'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or exists (
        select 1 from public.marchandises m
        where m.id::text = (storage.foldername(name))[2]
          and m.statut = 'publiee'
          and (
            exists (
              select 1 from public.abonnes vendeur
              where vendeur.id = m.vendeur_id and vendeur.statut = 'actif'
            )
            or exists (
              select 1 from public.admins
              where admins.id = m.vendeur_id
            )
          )
          and (
            exists (
              select 1 from public.abonnes lecteur
              where lecteur.id = auth.uid() and lecteur.statut = 'actif'
            )
            or exists (
              select 1 from public.admins
              where admins.id = auth.uid()
            )
          )
      )
    )
  );
