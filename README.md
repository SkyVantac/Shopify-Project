# SKY VANTAC — Brique 1 : inscription + paiement + accès membre

Ce projet fait UNIQUEMENT ceci pour l'instant :

1. Un visiteur crée un compte (e-mail + mot de passe).
2. Il est redirigé vers Stripe Checkout pour payer l'abonnement (1000&nbsp;€/an).
3. Une fois que **Stripe confirme le paiement** (via un webhook), son accès
   à `/membre` s'ouvre automatiquement.
4. Tant que Stripe n'a rien confirmé, l'accès reste fermé — même si la
   personne revient sur le site cent fois.

## Comment ça marche (en simple)

- **Supabase** garde les comptes (e-mail / mot de passe) et une table
  `abonnes` qui dit, pour chaque personne, si elle a payé (`actif`) ou
  pas encore (`en_attente`).
- **Stripe** gère le paiement. Après paiement, Stripe appelle notre site
  en coulisses (un "webhook") pour dire "cette personne a payé". C'est
  seulement à ce moment-là que le statut passe à `actif`.
- Personne — ni l'utilisateur, ni même une erreur de code côté site — ne
  peut mettre son propre statut à `actif`. Seule la clé secrète Stripe →
  webhook peut le faire.

## Ce qu'il te reste à faire (5 étapes)

### 1. Récupérer l'URL de ton projet Supabase
Supabase → ton projet → **Settings → API → Project URL**.
Colle-la dans le fichier `.env.local` à la ligne `NEXT_PUBLIC_SUPABASE_URL`.

### 2. Désactiver la confirmation par e-mail (pour l'instant)
Supabase → **Authentication → Sign In / Providers → Email** → décoche
"Confirm email". (On pourra la réactiver plus tard, dans une prochaine
brique — pour l'instant ça simplifie le parcours inscription → paiement.)

### 3. Créer la table dans Supabase
Supabase → **SQL Editor → New query** → colle tout le contenu du fichier
`supabase/schema.sql` de ce projet → clique **Run**.
Ça crée la table `abonnes` qui garde en mémoire qui a payé.

### 4. Configurer le webhook Stripe
C'est l'étape la plus importante : c'est elle qui permet à Stripe de dire
à ton site "ce client a payé".

**Pour tester en local (sur ton ordinateur) :**
1. Installe l'outil Stripe CLI : https://docs.stripe.com/stripe-cli
2. Connecte-le à ton compte : `stripe login`
3. Lance : `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. La commande affiche une clé qui commence par `whsec_...` → colle-la
   dans `.env.local` à la ligne `STRIPE_WEBHOOK_SECRET`.
5. Laisse cette commande tourner dans un terminal pendant que tu testes.

**Pour la mise en ligne (plus tard, quand le site sera hébergé) :**
Stripe → **Développeurs → Webhooks → Ajouter un endpoint** → mets l'adresse
`https://TON-DOMAINE/api/webhooks/stripe` → sélectionne l'événement
`checkout.session.completed` (et `customer.subscription.deleted`) → Stripe
te donnera un nouveau `whsec_...` à mettre en ligne à ce moment-là.

### 5. Lancer le site
```bash
npm install
npm run dev
```
Ouvre http://localhost:3000 dans ton navigateur.

## Tester le parcours complet

1. Lance `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
   dans un terminal (garde-le ouvert).
2. Lance `npm run dev` dans un autre terminal.
3. Va sur http://localhost:3000/inscription, crée un compte de test.
4. Tu arrives sur Stripe Checkout : utilise une carte de test, par exemple
   `4242 4242 4242 4242`, une date future, n'importe quel CVC.
5. Après le paiement, tu es redirigé vers "On confirme ton paiement...".
   En quelques secondes, tu es automatiquement envoyé vers `/membre`.

Si ça reste bloqué sur "on confirme ton paiement", vérifie que la commande
`stripe listen` tourne toujours et que `STRIPE_WEBHOOK_SECRET` dans
`.env.local` correspond bien à celle qu'elle a affichée.

## Fichiers importants

- `.env.local` — toutes les clés secrètes (jamais envoyé sur GitHub).
- `supabase/schema.sql` — à coller dans Supabase une seule fois.
- `src/app/inscription` — page de création de compte.
- `src/app/connexion` — page de connexion.
- `src/app/api/checkout` — crée la session de paiement Stripe.
- `src/app/api/webhooks/stripe` — reçoit la confirmation de paiement de Stripe.
- `src/app/membre` — l'espace réservé aux abonnés actifs.
- `src/proxy.ts` — vérifie à chaque visite que la personne est bien connectée
  et abonnée avant de la laisser entrer dans `/membre`.
