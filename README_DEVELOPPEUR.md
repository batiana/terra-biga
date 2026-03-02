# Terra Biga — Livraison codebase v2.0

## Stack technique
- **Frontend** : React 19 + TypeScript + Vite + TailwindCSS v4 + shadcn/ui
- **Backend** : Node.js + tRPC 11 (API type-safe)
- **ORM** : Drizzle ORM + MySQL
- **Auth** : OTP par SMS (auth.phone.ts)
- **Paiement** : Ligidicash (intégration complète)
- **Notifications** : WhatsApp (whatsapp.ts)
- **Monorepo** : pnpm workspaces

## Structure du projet

```
terra-biga/
├── client/                   # React SPA
│   └── src/
│       ├── pages/            # 20 pages
│       ├── components/       # Header, Footer, Layout, ShareCagnotte…
│       ├── lib/              # trpc.ts, utils.ts
│       └── App.tsx           # Router wouter
├── server/                   # Node.js API
│   ├── routers.ts            # 12 routeurs tRPC
│   ├── db.ts                 # 37 fonctions DB
│   ├── auth.phone.ts         # Auth OTP SMS
│   ├── ogRoutes.ts           # Open Graph (partage social)
│   └── services/
│       ├── ligidicash.ts     # Paiement Mobile Money
│       ├── whatsapp.ts       # Notifications WhatsApp
│       └── notifyUser.ts
│       └── webhooks/
│           └── ligidicash.ts # Webhook confirmation paiement
├── drizzle/                  # Migrations SQL
│   └── schema.ts             # 15 tables
└── shared/
    └── types.ts              # Types partagés client/serveur
```

## Pages disponibles (client/src/pages/)

| Page | Route | Description |
|------|-------|-------------|
| Home.tsx | / | Accueil (bleu + vert, Playfair Display) |
| TeRaga.tsx | /te-raga | Catalogue produits achat groupé |
| TeRagaProduct.tsx | /te-raga/:slug | Détail produit + rejoindre groupe |
| TeRagaFlow.tsx | /te-raga/groupe/:id | Flow complet : identité → paiement → confirmation |
| MaCagnotte.tsx | /ma-cagnotte | Liste des cagnottes actives |
| CagnotteWizardStep1.tsx | /mam-cagnotte/nouvelle | Étape 1 : choix catégorie |
| CagnotteWizardStep2.tsx | /mam-cagnotte/nouvelle/:cat | Étape 2 : formulaire + création |
| CagnotteSuccess.tsx | /mam-cagnotte/succes/:slug | Confirmation + partage |
| CagnottePublic.tsx | /c/:slug | Page publique cagnotte (partage) |
| CagnotteDetail.tsx | /ma-cagnotte/:id | Détail cagnotte (porteur) |
| DashboardPorteur.tsx | /dashboard | Dashboard porteur de projet |
| Login.tsx | /connexion | Connexion OTP |
| Profil.tsx | /profil | Profil utilisateur |
| Admin.tsx | /admin | Interface admin |
| DonBigaConnect.tsx | /don-biga-connect | Partenariats ONG |
| APropos.tsx | /a-propos | À propos |
| Contact.tsx | /contact | Contact |
| News.tsx | /actualites | Actualités |

## Schéma base de données (15 tables)
users, otpCodes, otpAttempts, products, groups, orders, identities,
cagnottes, contributions, donations, pointTransactions, payments,
notifications, cagnotteUpdates, adminConfig

## Installation

```bash
# Prérequis : Node.js 20+, pnpm, MySQL
npm install -g pnpm

# Installer les dépendances
pnpm install

# Variables d'environnement
cp .env.example .env
# Remplir : DATABASE_URL, LIGIDICASH_API_KEY, WHATSAPP_TOKEN…

# Migrations DB
pnpm drizzle-kit push

# Seed de données de test
node seed.mjs

# Lancer en développement
pnpm dev
```

## Variables d'environnement requises (.env)

```env
DATABASE_URL=mysql://user:password@host:3306/terrabiga
LIGIDICASH_API_KEY=your_key
LIGIDICASH_STORE_ID=your_store_id
WHATSAPP_TOKEN=your_whatsapp_token
WHATSAPP_PHONE_ID=your_phone_id
FRONTEND_URL=https://terrabiga.bf
SESSION_SECRET=random_secret_32_chars_min
```

## Ce qui reste à implémenter (TODOs prioritaires)

1. **Auth OTP** — `auth.phone.ts` est codé, intégrer avec un provider SMS (Orange SMS API ou Twilio)
2. **Orange Money API** — Accord commercial requis (Q2 2026), remplacer Ligidicash
3. **Notifications WhatsApp** — Templates à soumettre à Meta pour approbation
4. **Dashboard ONG** — Admin panel pour les associations partenaires
5. **Tests** — 3 fichiers de test présents (`*.test.ts`), étendre la couverture

## Commandes utiles

```bash
pnpm dev          # Dev server (client + serveur en parallèle)
pnpm build        # Build production
pnpm typecheck    # Vérification TypeScript
pnpm test         # Tests vitest
pnpm drizzle-kit studio  # Interface graphique DB
```

## Design system

Couleurs Tailwind personnalisées (index.css) :
- `tb-orange` : #E8730A (accentuation)
- `tb-green`  : #1A7A4A (Mam Cagnotte / CTA principal)
- `tb-blue`   : #1B4FD8 (Te Raga / accueil)

Composants UI : shadcn/ui (~/components/ui/)
Typographie home : Playfair Display (titres) + DM Sans (corps)

---
*Livraison Claude AI — Mars 2026*
