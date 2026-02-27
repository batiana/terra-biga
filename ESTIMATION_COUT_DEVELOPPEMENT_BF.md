# ESTIMATION DE COÛT — DÉVELOPPEMENT TERRA BIGA
## Pour le Marché du Burkina Faso

**Date :** 26 février 2026  
**Basé sur :** Handoff document + Cahier des Charges V3.1  
**Devise :** FCFA (Franc CFA)

---

## 📊 RÉSUMÉ EXÉCUTIF

| Phase | Durée | Coût Estimé | Statut |
|-------|-------|-------------|--------|
| **Phase 1 (Blocages critiques)** | 18-22 jours | **2,700,000 - 3,300,000 FCFA** | 🔴 URGENT |
| **Phase 2 (Fonctionnalités importantes)** | 20-25 jours | **3,000,000 - 3,750,000 FCFA** | ⚠️ Important |
| **Phase 3 (Intégrations avancées)** | 15-20 jours | **2,250,000 - 3,000,000 FCFA** | 🟡 Optionnel |
| **TOTAL (Lancement complet)** | **55-67 jours** | **7,950,000 - 10,050,000 FCFA** | — |

---

## 💰 DÉTAIL DES COÛTS PAR PHASE

### **PHASE 1 — Blocages Critiques (18-22 jours)**

**Objectif :** Rendre la plateforme opérationnelle en production

#### Tâche 1 : Authentification OTP Téléphone (4-5 jours)
- **Description :** Implémentation du login par SMS/WhatsApp (remplacement Manus OAuth)
- **Fichiers :** server/auth.phone.ts, server/services/whatsapp.ts, client/src/pages/Login.tsx
- **Effort :** 4-5 jours
- **Coût :** 600,000 - 750,000 FCFA
- **Détail :**
  - Configuration Meta Cloud API (WhatsApp Business)
  - Envoi OTP 6 chiffres
  - Vérification code + création JWT
  - Rate limiting (5 tentatives/15 min)
  - UI formulaire téléphone + saisie OTP
  - Tests d'intégration

#### Tâche 2 : Intégration Ligidicash Réelle (5-6 jours)
- **Description :** Remplacement de la simulation de paiement par l'API Ligidicash réelle
- **Fichiers :** server/services/ligidicash.ts, server/_core/index.ts
- **Effort :** 5-6 jours
- **Coût :** 750,000 - 900,000 FCFA
- **Détail :**
  - Création du service Ligidicash (initier paiement, vérifier signature)
  - Implémentation webhook /api/webhooks/ligidicash
  - Vérification HMAC signature callback
  - Idempotence (pas de double comptage)
  - Mise à jour statut paiement en BDD
  - Tests webhook en sandbox
  - Gestion des erreurs et retries

#### Tâche 3 : Système Freemium (3 gratuites → 500 FCFA) (2-3 jours)
- **Description :** Logique de quota cagnottes gratuites + paiement pour les suivantes
- **Fichiers :** server/routers.ts, server/db.ts, client/src/pages/CagnotteCreate.tsx
- **Effort :** 2-3 jours
- **Coût :** 300,000 - 450,000 FCFA
- **Détail :**
  - Fonction countUserCagnottes(userId)
  - Vérification quota avant création
  - Blocage création + affichage modale paiement
  - Création cagnotte après paiement confirmé
  - Traçabilité freemiumFeesPaid en BDD

#### Tâche 4 : Notifications WhatsApp Utilisateurs (3-4 jours)
- **Description :** Envoi de messages WhatsApp aux utilisateurs (5 templates prioritaires)
- **Fichiers :** server/services/notifyUser.ts, server/routers.ts
- **Effort :** 3-4 jours
- **Coût :** 450,000 - 600,000 FCFA
- **Détail :**
  - Service notifyUser.ts (orchestrateur)
  - 5 templates prioritaires :
    - Nouvelle contribution (vers porteur)
    - Objectif atteint
    - Validation identité Te Raga
    - Groupe complet
    - Commande prête
  - Gestion des erreurs silencieuses
  - Tests d'envoi

#### Tâche 5 : Corrections Mineures (1-2 jours)
- **Description :** Fixes anomalies identifiées + slug URLs
- **Fichiers :** drizzle/schema.ts, server/routers.ts, client/src/App.tsx
- **Effort :** 1-2 jours
- **Coût :** 150,000 - 300,000 FCFA
- **Détail :**
  - targetAmount optionnel (au lieu de min 1000)
  - Ajout slug varchar(255) à cagnottes
  - Route /c/:slug pour URLs courtes
  - Suppression bloc simulation paiement
  - Corrections routing

#### Tâche 6 : Tests d'Intégration Complets (1-2 jours)
- **Description :** Tests E2E des scénarios critiques
- **Effort :** 1-2 jours
- **Coût :** 150,000 - 300,000 FCFA
- **Détail :**
  - Scénario Te Raga complet (groupe → identité → acompte → solde)
  - Scénario Mam Cagnotte (création → partage → contribution)
  - Tests OTP + paiement
  - Validation webhook Ligidicash
  - Tests Vitest (tous passants)

**TOTAL PHASE 1 :** **18-22 jours** → **2,400,000 - 3,300,000 FCFA**

---

### **PHASE 2 — Fonctionnalités Importantes (20-25 jours)**

**Objectif :** Compléter les fonctionnalités manquantes importantes

#### Tâche 1 : Feed Mises à Jour Porteur (3 jours)
- **Description :** Permettre au porteur de publier des mises à jour de progression
- **Coût :** 450,000 FCFA
- **Détail :** Table cagnotteUpdates, formulaire publication, affichage feed

#### Tâche 2 : Actions Porteur Avancées (2 jours)
- **Description :** Pause, clôture, modification cagnotte
- **Coût :** 300,000 FCFA
- **Détail :** Boutons actions, logique métier, notifications

#### Tâche 3 : Bouton 'Remercier' Contributeur (1 jour)
- **Description :** Envoi message WhatsApp personnalisé à un contributeur
- **Coût :** 150,000 FCFA
- **Détail :** Service notifyUser étendu, template personnalisé

#### Tâche 4 : Dashboard ONG Complet (3 jours)
- **Description :** Pages /ong/... pour gestion projets solidaires
- **Coût :** 450,000 FCFA
- **Détail :** Listing projets, détail projet, suivi collecte, mises à jour

#### Tâche 5 : Gestion Cycle Groupe Admin (2 jours)
- **Description :** Transitions OPEN → FULL → ORDERED → DELIVERED → COMPLETED
- **Coût :** 300,000 FCFA
- **Détail :** Boutons transitions, vérifications métier, notifications groupe

#### Tâche 6 : Remboursement Dépôt 10% (2 jours)
- **Description :** Logique remboursement si groupe non complété après délai
- **Coût :** 300,000 FCFA
- **Détail :** Calcul délai, trigger remboursement, notification utilisateur

#### Tâche 7 : Matrice RACI Admin (2 jours)
- **Description :** Rôles MODERATOR, FINANCE, SUPPORT (au lieu d'un seul ADMIN)
- **Coût :** 300,000 FCFA
- **Détail :** Enum UserRole étendu, middleware tRPC, permissions par route

#### Tâche 8 : Points BIGA Actifs (2 jours)
- **Description :** Attribution réelle de points (50 inscription, 75 parrainage, etc.)
- **Coût :** 300,000 FCFA
- **Détail :** Logique attribution, conversion en réductions, classement utilisateurs

#### Tâche 9 : Notifications WhatsApp Restantes (1 jour)
- **Description :** 5 templates supplémentaires (rejet identité, bienvenue, etc.)
- **Coût :** 150,000 FCFA
- **Détail :** Templates additionnels, intégration dans workflows

#### Tâche 10 : KPIs Dashboard Admin (1,5 jours)
- **Description :** Statistiques temps réel (utilisateurs, revenus, transactions)
- **Coût :** 225,000 FCFA
- **Détail :** Requêtes SQL optimisées, graphiques, export

#### Tâche 11 : Politique Expiration Cagnotte (2 jours)
- **Description :** Cagnottes expirées après 60 jours (prolongation 30j max)
- **Coût :** 300,000 FCFA
- **Détail :** CRON job, logique métier, notifications

#### Tâche 12 : Signalement Cagnotte (1,5 jours)
- **Description :** Bouton signalement + workflow admin
- **Coût :** 225,000 FCFA
- **Détail :** Formulaire signalement, liste admin, actions modération

**TOTAL PHASE 2 :** **20-25 jours** → **3,000,000 - 3,750,000 FCFA**

---

### **PHASE 3 — Intégrations Avancées (15-20 jours)**

**Objectif :** Intégrations partenaires et fonctionnalités premium

#### Tâche 1 : API Orange Money Option 1 (5-8 jours)
- **Description :** Suivi webhooks transactions P2P (sans collecte fonds)
- **Coût :** 750,000 - 1,200,000 FCFA
- **Condition :** Accord Orange Money BF signé
- **Détail :** Service Orange Money, webhook, réconciliation transactions

#### Tâche 2 : API Orange Money Option 2 (8-10 jours)
- **Description :** Split paiement (Orange prend %)
- **Coût :** 1,200,000 - 1,500,000 FCFA
- **Condition :** Accord commercial Orange + Option 1
- **Détail :** Logique split, calcul commission, reporting

#### Tâche 3 : Intégration Max it (3-5 jours)
- **Description :** Mini-app Orange responsive (360px, 3G optimisé)
- **Coût :** 450,000 - 750,000 FCFA
- **Condition :** Accord partenariat Max it
- **Détail :** Iframe responsive, authentification cross-domain, tests téléphones

#### Tâche 4 : Provider Moov Money (3 jours)
- **Description :** Ajout Moov Money comme alternative paiement
- **Coût :** 450,000 FCFA
- **Condition :** Accord Moov BF
- **Détail :** Service Moov Money, webhook, enum PaymentMethod

#### Tâche 5 : Cagnotte Pro Entreprises (4 jours)
- **Description :** Cagnottes avec contreparties avancées
- **Coût :** 600,000 FCFA
- **Condition :** Étude marché Phase 2
- **Détail :** Enum CagnotteType étendu, rewards avancées, pricing

#### Tâche 6 : Analytics Avancés (2 jours)
- **Description :** Mixpanel ou équivalent RGPD-compliant
- **Coût :** 300,000 FCFA
- **Condition :** Budget analytics
- **Détail :** Intégration SDK, événements clés, dashboards

#### Tâche 7 : Internationalisation FR/EN/Mooré (3 jours)
- **Description :** Support multilingue complet
- **Coût :** 450,000 FCFA
- **Condition :** Traductions disponibles
- **Détail :** i18n setup, traduction UI, sélecteur langue

#### Tâche 8 : PWA Service Worker (3 jours)
- **Description :** Cache offline, installation app
- **Coût :** 450,000 FCFA
- **Condition :** Stabilité Phase 1-2
- **Détail :** Service Worker, manifest, offline pages

**TOTAL PHASE 3 :** **15-20 jours** → **2,250,000 - 3,000,000 FCFA**

---

## 📋 TARIFICATION PAR PROFIL DÉVELOPPEUR (BURKINA FASO)

### **Tarifs Journaliers Estimés**

| Profil | Tarif Journalier | Expérience | Adapté pour |
|--------|-----------------|-----------|------------|
| **Junior** | 75,000 - 100,000 FCFA | 0-2 ans | Tâches simples, UI |
| **Confirmé** | 100,000 - 150,000 FCFA | 2-5 ans | Tâches standard, API |
| **Senior** | 150,000 - 200,000 FCFA | 5+ ans | Architecture, intégrations |
| **Lead/Freelance** | 200,000 - 250,000 FCFA | 7+ ans | Gestion projet, décisions |

### **Recommandation**

Pour Terra Biga, **profil Confirmé à Senior** est recommandé :
- Phase 1 (blocages critiques) : **Senior** (150,000 - 200,000 FCFA/jour)
- Phase 2 (fonctionnalités) : **Confirmé** (100,000 - 150,000 FCFA/jour)
- Phase 3 (intégrations) : **Senior** (150,000 - 200,000 FCFA/jour)

---

## 💵 SCÉNARIOS DE COÛTS TOTAUX

### **Scénario 1 : Lancement Minimal (Phase 1 seule)**

**Objectif :** Plateforme opérationnelle en production

| Composant | Durée | Tarif/jour | Coût |
|-----------|-------|-----------|------|
| Phase 1 | 18-22 jours | 150,000 FCFA | 2,700,000 - 3,300,000 FCFA |
| **TOTAL** | — | — | **2,700,000 - 3,300,000 FCFA** |

**Délai :** 4-5 semaines  
**Livrable :** Plateforme fonctionnelle avec paiements réels, login OTP, freemium

---

### **Scénario 2 : Lancement Complet (Phase 1 + 2)**

**Objectif :** Plateforme avec toutes les fonctionnalités importantes

| Composant | Durée | Tarif/jour | Coût |
|-----------|-------|-----------|------|
| Phase 1 | 18-22 jours | 150,000 FCFA | 2,700,000 - 3,300,000 FCFA |
| Phase 2 | 20-25 jours | 125,000 FCFA | 2,500,000 - 3,125,000 FCFA |
| **TOTAL** | **38-47 jours** | — | **5,200,000 - 6,425,000 FCFA** |

**Délai :** 8-10 semaines  
**Livrable :** Plateforme complète avec ONG, admin avancé, notifications

---

### **Scénario 3 : Lancement Complet + Intégrations (Phase 1 + 2 + 3)**

**Objectif :** Plateforme complète avec Orange Money et Max it

| Composant | Durée | Tarif/jour | Coût |
|-----------|-------|-----------|------|
| Phase 1 | 18-22 jours | 150,000 FCFA | 2,700,000 - 3,300,000 FCFA |
| Phase 2 | 20-25 jours | 125,000 FCFA | 2,500,000 - 3,125,000 FCFA |
| Phase 3 | 15-20 jours | 150,000 FCFA | 2,250,000 - 3,000,000 FCFA |
| **TOTAL** | **53-67 jours** | — | **7,450,000 - 9,425,000 FCFA** |

**Délai :** 12-14 semaines  
**Livrable :** Plateforme complète avec tous les services

---

## 🎯 RECOMMANDATION DE STRATÉGIE

### **Approche Recommandée : Lancement Progressif**

**Phase 1 (Semaines 1-5) :**
- Coût : 2,700,000 - 3,300,000 FCFA
- Lancer en production avec les 3 blocages résolus
- Générer premiers revenus (freemium 500 FCFA)

**Phase 2 (Semaines 6-10) :**
- Coût : 2,500,000 - 3,125,000 FCFA
- Ajouter fonctionnalités manquantes
- Améliorer rétention utilisateurs

**Phase 3 (Semaines 11-14) :**
- Coût : 2,250,000 - 3,000,000 FCFA
- Intégrer Orange Money (si accord signé)
- Multiplier les canaux de paiement

**TOTAL PROGRESSIF :** 7,450,000 - 9,425,000 FCFA sur 14 semaines

---

## ⚠️ COÛTS ADDITIONNELS NON INCLUS

| Coût | Montant Estimé | Responsable |
|------|----------------|-------------|
| **Hébergement Manus** | 50,000 - 100,000 FCFA/mois | Client |
| **Domaine personnalisé** | 20,000 - 50,000 FCFA/an | Client |
| **SMS/WhatsApp** | 5,000 - 20,000 FCFA/mois (selon volume) | Client |
| **Support développeur** | 30,000 - 50,000 FCFA/jour | À négocier |
| **Maintenance annuelle** | 10% du coût développement | À négocier |
| **Tests QA externe** | 500,000 - 1,000,000 FCFA | Optionnel |
| **Sécurité/Audit** | 1,000,000 - 2,000,000 FCFA | Optionnel |

---

## 📊 COMPARAISON AVEC MARCHÉ INTERNATIONAL

| Région | Tarif Journalier | Coût Phase 1 | Coût Total |
|--------|-----------------|-------------|-----------|
| **Burkina Faso** | 100,000 - 200,000 FCFA | 2,7M - 3,3M | 7,5M - 9,4M |
| **Afrique de l'Ouest** | 100,000 - 250,000 FCFA | 2,7M - 4M | 8M - 12M |
| **France/Europe** | €100 - €200 (65,600 - 131,200 FCFA) | €1,800 - €4,400 (1,2M - 2,9M) | €5,500 - €13,400 (3,6M - 8,8M) |
| **Inde/Asie** | $20 - $50 (11,600 - 29,000 FCFA) | $360 - $1,100 (210K - 640K) | $1,100 - $2,700 (640K - 1,6M) |

**Avantage Burkina Faso :** Coûts 2-3x plus compétitifs qu'Europe, qualité comparable à Afrique de l'Ouest

---

## ✅ CHECKLIST AVANT SIGNATURE

**À clarifier avec le développeur :**

- [ ] Tarif journalier exact (Junior/Confirmé/Senior)
- [ ] Nombre de jours estimés par phase (confirmer 18-22j Phase 1)
- [ ] Conditions de paiement (acompte ? étapes ?)
- [ ] Délais de livraison (4-5 semaines Phase 1 ?)
- [ ] Garantie (bugs ? support post-lancement ?)
- [ ] Propriété intellectuelle (code source ?)
- [ ] Conditions d'arrêt (si projet annulé ?)
- [ ] Accès GitHub (quand ?)
- [ ] Environnement de test (staging ?)

---

## 🎓 PROFIL DÉVELOPPEUR IDÉAL

**Pour Terra Biga, rechercher :**

- ✅ 3-5+ ans d'expérience (Confirmé/Senior)
- ✅ Maîtrise React + Express + tRPC
- ✅ Expérience intégrations paiement (Ligidicash, Orange Money)
- ✅ Expérience WhatsApp Business API
- ✅ Bases de données MySQL/Drizzle
- ✅ Tests unitaires (Vitest)
- ✅ Déploiement cloud (Manus, Vercel, etc.)
- ✅ Français ou anglais courant
- ✅ Disponibilité 4-5 semaines minimum (Phase 1)

**Bonus :**
- Expérience fintech/paiements
- Connaissance marché Afrique de l'Ouest
- Expérience Orange Money / Ligidicash
- Portfolio avec projets similaires

---

## 📞 MODÈLES DE CONTRAT

### **Modèle 1 : Forfait Fixe par Phase**

```
Phase 1 (Blocages critiques) : 2,700,000 FCFA
- Livrable : Plateforme opérationnelle
- Délai : 4-5 semaines
- Paiement : 50% acompte, 50% à la livraison

Phase 2 (Fonctionnalités) : 2,500,000 FCFA
- Livrable : Fonctionnalités complètes
- Délai : 4-5 semaines
- Paiement : 50% acompte, 50% à la livraison
```

### **Modèle 2 : Régie (Jours Facturés)**

```
Tarif : 150,000 FCFA/jour (Senior)
Estimation Phase 1 : 18-22 jours = 2,700,000 - 3,300,000 FCFA
Facturation : Hebdomadaire
Paiement : Net 30 jours
```

### **Modèle 3 : Hybride (Forfait + Régie)**

```
Forfait Phase 1 : 2,700,000 FCFA (18 jours)
Dépassement : 150,000 FCFA/jour supplémentaire
Paiement : 50% acompte, 50% à la livraison
```

---

## 🎯 CONCLUSION

**Coût estimé pour Terra Biga :**

- **Lancement minimal (Phase 1) :** 2,7M - 3,3M FCFA (4-5 semaines)
- **Lancement complet (Phase 1+2) :** 5,2M - 6,4M FCFA (8-10 semaines)
- **Lancement complet + intégrations (Phase 1+2+3) :** 7,5M - 9,4M FCFA (12-14 semaines)

**Recommandation :** Démarrer par Phase 1 (2,7M - 3,3M FCFA) pour avoir une plateforme opérationnelle, puis ajouter les phases 2 et 3 progressivement selon les besoins et les revenus générés.

---

*Estimation réalisée le 26 février 2026 - Valide 30 jours*
