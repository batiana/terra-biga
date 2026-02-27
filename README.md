# Terra Biga — Patch v2 · Intégration Guide

## Fichiers générés

```
terra-biga-patch-v2/
├── drizzle/
│   ├── schema.ts                    ← Schema Drizzle mis à jour (slug, targetAmount nullable, nouvelles tables)
│   └── 0002_terra_biga_v2.sql       ← Migration SQL à appliquer
├── server/
│   ├── auth.phone.ts                ← Auth OTP complète (génération, stockage, rate limiting, JWT)
│   ├── routers.ts                   ← Routers tRPC mis à jour (freemium, slug, pause/close, updates)
│   ├── _core/
│   │   └── index.ts                 ← Enregistrement phone auth + webhook Ligidicash
│   ├── services/
│   │   ├── whatsapp.ts              ← Meta Cloud API (envoi OTP + templates)
│   │   ├── notifyUser.ts            ← 8 templates de notification WhatsApp
│   │   └── ligidicash.ts            ← Service Ligidicash (~80%, adapter endpoints)
│   └── webhooks/
│       └── ligidicash.ts            ← Webhook handler paiement Ligidicash
└── client/src/
    ├── App.tsx                      ← Routes mises à jour (/login, /c/:slug, /dashboard)
    └── pages/
        ├── Login.tsx                ← Page login OTP (2 étapes : téléphone → code)
        ├── CagnottePublic.tsx       ← Page publique /c/:slug (style GoFundMe)
        └── DashboardPorteur.tsx     ← Dashboard porteur (pause, clôture, mises à jour)
```

---

## Instructions d'intégration

### 1. Migration base de données

```bash
# Depuis la racine du projet
pnpm drizzle-kit push
# ou pour MySQL
mysql -u user -p terra_biga < drizzle/0002_terra_biga_v2.sql
```

### 2. Variables d'environnement à ajouter dans `.env`

```env
# WhatsApp Meta Cloud API
WHATSAPP_TOKEN=EAAxxxxxxx            # Bearer token Meta Business
WHATSAPP_PHONE_ID=10696xxxxxxx       # Phone Number ID (pas le numéro lui-même)

# Ligidicash (à compléter avec la doc API)
LIGIDICASH_API_URL=https://api.ligidicash.com/v1
LIGIDICASH_MERCHANT_ID=your_merchant_id
LIGIDICASH_API_KEY=your_api_key
LIGIDICASH_WEBHOOK_SECRET=your_webhook_secret

# App URL (pour les callbacks Ligidicash)
APP_URL=https://terrabiga.com
```

### 3. Remplacer les fichiers existants

```bash
# Copier les fichiers un par un dans le projet existant
cp server/auth.phone.ts      /path/to/project/server/auth.phone.ts
cp server/routers.ts         /path/to/project/server/routers.ts
cp server/_core/index.ts     /path/to/project/server/_core/index.ts
cp drizzle/schema.ts         /path/to/project/drizzle/schema.ts
cp client/src/App.tsx        /path/to/project/client/src/App.tsx
# etc.
```

### 4. Nouveaux fichiers à créer

```bash
cp server/services/whatsapp.ts      /path/to/project/server/services/whatsapp.ts
cp server/services/notifyUser.ts    /path/to/project/server/services/notifyUser.ts
cp server/services/ligidicash.ts    /path/to/project/server/services/ligidicash.ts
cp server/webhooks/ligidicash.ts    /path/to/project/server/webhooks/ligidicash.ts
cp client/src/pages/Login.tsx              /path/to/project/client/src/pages/Login.tsx
cp client/src/pages/CagnottePublic.tsx     /path/to/project/client/src/pages/CagnottePublic.tsx
cp client/src/pages/DashboardPorteur.tsx   /path/to/project/client/src/pages/DashboardPorteur.tsx
```

---

## Points restants (~1-2h) à compléter avec la doc Ligidicash

### `server/services/ligidicash.ts`
Chercher les commentaires `⚠️ TODO` :
- [ ] Confirmer les chemins d'endpoints (`INITIATE_PATH`, `STATUS_PATH`, `REFUND_PATH`)
- [ ] Confirmer les noms de champs du body (camelCase ou snake_case)
- [ ] Confirmer le format d'auth (Bearer token, HMAC per-request, etc.)
- [ ] Mapper les valeurs de statut réelles (`"success"` vs `"completed"`, etc.)

### `server/webhooks/ligidicash.ts`
- [ ] Confirmer le nom du header de signature (`X-Ligidicash-Signature` ou autre)
- [ ] Confirmer le format HMAC (algorithme, payload string format)

---

## Checklist de test

### Auth OTP
- [ ] `POST /api/auth/phone/request` avec `{ phone: "70000000" }` → SMS WhatsApp envoyé
- [ ] `POST /api/auth/phone/verify` avec `{ phone: "70000000", code: "123456" }` → cookie session
- [ ] Rate limit : 6ème tentative en < 15min → HTTP 429
- [ ] OTP expiré (> 10min) → `otp_expired` error

### Page publique `/c/:slug`
- [ ] Créer une cagnotte → slug auto-généré visible dans la réponse
- [ ] Naviguer sur `/c/<slug>` → page publique avec progression, contributeurs
- [ ] Contribuer sans compte → formulaire 2 étapes, confirmation
- [ ] Bouton "Remercier via WhatsApp" visible au hover sur chaque contributeur

### Dashboard porteur
- [ ] Naviguer sur `/ma-cagnotte/dashboard` → liste des cagnottes
- [ ] Cliquer sur pause → statut "En pause", bouton play apparaît
- [ ] Publier une mise à jour → apparaît sur la page publique
- [ ] Onglet Partager → lien public + boutons réseaux

### Freemium
- [ ] Créer 3 cagnottes avec le même numéro → 3ème gratuite
- [ ] Tenter une 4ème → `requiresPayment: true` + modal Ligidicash
- [ ] Catégories `sante` et `association_ong` → toujours gratuites

---

## Notes architecture

- **JWT** : La session phone utilise le même format JWT que le système Manus OAuth existant (HS256, même secret `JWT_SECRET`). `sdk.authenticateRequest()` fonctionne sans modification.
- **Slug** : Généré automatiquement à la création. Format : `titre-normalise-nanoid6`. Unique en base via constraint UNIQUE.
- **Freemium** : Le comptage exclut les cagnottes `rejected`. Les catégories `sante` et `association_ong` sont exemptées du quota.
- **Webhook Ligidicash** : Idempotent (double appel ignoré si déjà `completed`/`failed`). Le `rawBody` est capturé avant `express.json()` dans `_core/index.ts`.
