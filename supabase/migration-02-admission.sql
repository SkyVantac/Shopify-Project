-- ============================================================
-- SKY VANTAC — Brique 2 : candidature avec validation admin
-- À copier-coller dans Supabase -> SQL Editor -> "New query" -> Run
-- (à exécuter APRÈS supabase/schema.sql, une seule fois)
-- ============================================================

-- On élargit les statuts possibles :
--   en_attente = compte créé, pas encore payé
--   en_revue   = a payé, en attente de ta validation (nouveau)
--   actif      = validé, accès ouvert
--   refuse     = candidature refusée (nouveau) — à rembourser toi-même dans Stripe
--   annule     = abonnement résilié après avoir été actif
alter table public.abonnes drop constraint if exists abonnes_statut_check;
alter table public.abonnes add constraint abonnes_statut_check
  check (statut in ('en_attente', 'en_revue', 'actif', 'refuse', 'annule'));

-- Date à laquelle le paiement a été confirmé, pour suivre le délai de 24h.
alter table public.abonnes add column if not exists paye_le timestamptz;

-- Rien à changer côté RLS : la policy de lecture existante
-- ("un utilisateur voit son propre statut") continue de s'appliquer
-- normalement, et seule la clé secrète peut écrire.
