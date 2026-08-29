-- ============================================================
-- SKY VANTAC — Brique 4 : correctif des privilèges sur marchandises
-- À copier-coller dans Supabase -> SQL Editor -> "New query" -> Run
-- ============================================================

-- "permission denied for table marchandises" en écrivant avec le
-- client admin (clé secrète, service_role) indique que ce rôle n'a
-- pas les droits SQL de base sur la table — un problème distinct des
-- policies RLS (que service_role contourne déjà). Les policies RLS ne
-- s'appliquent qu'APRÈS que ces droits de base existent : sans eux,
-- même service_role est bloqué. Cette instruction manquait dans
-- migration-03-marchandises.sql.

grant select, insert, update, delete on public.marchandises to service_role;

-- Utile pour la future page d'affichage (/marchandises), qui lira
-- directement via le client authentifié en s'appuyant sur les policies
-- RLS déjà en place plutôt que de tout faire passer par service_role.
grant select on public.marchandises to authenticated;

-- marchandises_photos n'a aucune policy RLS pour "authenticated" (accès
-- exclusivement côté serveur) : seul service_role a besoin des droits.
grant select, insert, update, delete on public.marchandises_photos to service_role;
