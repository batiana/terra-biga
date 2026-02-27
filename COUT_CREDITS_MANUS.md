# COÛT EN CRÉDITS MANUS — Terra Biga Phase 1
## Estimation Détaillée du Travail IA

**Date :** 26 février 2026  
**Projet :** Terra Biga - Développement Services + Migrations + Procédures + Pages + Tests  
**Durée estimée :** 5-7 jours de travail IA

---

## 📊 RÉSUMÉ EXÉCUTIF

| Composant | Crédits Estimés | Coût USD | Coût FCFA |
|-----------|-----------------|----------|-----------|
| **Services (3)** | 15,000 - 20,000 | $30 - $40 | 19,500 - 26,000 |
| **Migrations & Schéma (3)** | 8,000 - 12,000 | $16 - $24 | 10,400 - 15,600 |
| **Procédures tRPC (4)** | 10,000 - 15,000 | $20 - $30 | 13,000 - 19,500 |
| **Pages React (2)** | 12,000 - 18,000 | $24 - $36 | 15,600 - 23,400 |
| **Tests Unitaires (2)** | 10,000 - 15,000 | $20 - $30 | 13,000 - 19,500 |
| **Documentation (2)** | 8,000 - 12,000 | $16 - $24 | 10,400 - 15,600 |
| **TOTAL PHASE 1** | **63,000 - 92,000 crédits** | **$126 - $184** | **82,000 - 120,000 FCFA** |

---

## 💳 MODÈLE DE TARIFICATION MANUS

### **Tarification Standard Manus (Estimation)**

**Basé sur les tarifs publics Manus :**

| Type de Tâche | Crédits/Heure | Complexité | Exemple |
|---------------|---------------|-----------|---------|
| **Code simple** | 1,000 - 2,000 | Basse | Fonction DB simple |
| **Code standard** | 2,000 - 3,500 | Moyenne | Service complet |
| **Code complexe** | 3,500 - 5,000 | Haute | Logique métier |
| **Tests** | 1,500 - 2,500 | Moyenne | Suite de tests |
| **Documentation** | 1,000 - 1,500 | Basse | README, guides |

**Conversion :**
- 1 crédit Manus ≈ $0.002 - $0.003 USD
- 1 crédit Manus ≈ 1.3 - 1.95 FCFA
- 1,000 crédits ≈ $2 - $3 USD ≈ 1,300 - 1,950 FCFA

---

## 📋 DÉTAIL DES COÛTS PAR TÂCHE

### **CATÉGORIE 1 : Services (15,000 - 20,000 crédits)**

#### Tâche 1 : server/services/whatsapp.ts
**Durée :** 2-3 heures  
**Complexité :** Moyenne (API externe, gestion erreurs)  
**Crédits :** 5,000 - 7,500
- Création service complet
- Fonctions sendOTP(), sendNotification()
- Gestion erreurs et retries
- Types TypeScript
- Commentaires détaillés

#### Tâche 2 : server/services/ligidicash.ts
**Durée :** 3-4 heures  
**Complexité :** Haute (sécurité, signature HMAC)  
**Crédits :** 7,500 - 10,000
- Service Ligidicash complet
- Fonctions initiatePaiement(), verifyWebhookSignature()
- Gestion des erreurs
- Logging et monitoring
- Types TypeScript

#### Tâche 3 : server/services/notifyUser.ts
**Durée :** 2-3 heures  
**Complexité :** Moyenne (orchestration, templates)  
**Crédits :** 5,000 - 7,500
- Service orchestrateur
- 8 templates WhatsApp
- Gestion des erreurs silencieuses
- Logging

**TOTAL CATÉGORIE 1 :** 17,500 - 25,000 crédits

---

### **CATÉGORIE 2 : Migrations & Schéma (8,000 - 12,000 crédits)**

#### Tâche 4 : Ajouter slug aux cagnottes
**Durée :** 1-2 heures  
**Complexité :** Basse (modification simple)  
**Crédits :** 2,500 - 4,000
- Modification schema.ts
- Génération migration Drizzle
- Index sur slug

#### Tâche 5 : Créer table cagnotteUpdates
**Durée :** 1-2 heures  
**Complexité :** Basse  
**Crédits :** 2,500 - 4,000
- Table cagnotteUpdates
- Relations Drizzle
- Migration

#### Tâche 6 : Créer table otpCodes
**Durée :** 1 heure  
**Complexité :** Basse  
**Crédits :** 1,500 - 2,000
- Table otpCodes
- Index sur phone + expiresAt
- Migration

#### Tâche 7 : Générer migrations Drizzle
**Durée :** 1-2 heures  
**Complexité :** Basse  
**Crédits :** 2,000 - 3,000
- Exécution pnpm db:push
- Validation migrations
- Documentation

**TOTAL CATÉGORIE 2 :** 8,500 - 13,000 crédits

---

### **CATÉGORIE 3 : Procédures tRPC (10,000 - 15,000 crédits)**

#### Tâche 8 : Fonction DB countUserCagnottes()
**Durée :** 1 heure  
**Complexité :** Basse  
**Crédits :** 1,500 - 2,000
- Fonction DB simple
- Requête SQL optimisée

#### Tâche 9 : Procédure tRPC cagnottes.countByUser()
**Durée :** 1 heure  
**Complexité :** Basse  
**Crédits :** 1,500 - 2,000
- Procédure protectedProcedure
- Validation input

#### Tâche 10 : Procédure tRPC cagnottes.getBySlug()
**Durée :** 1,5 heures  
**Complexité :** Moyenne  
**Crédits :** 2,500 - 3,500
- Procédure publicProcedure
- Jointure avec contributions
- Gestion erreurs

#### Tâche 11 : Procédure tRPC cagnottes.createUpdate()
**Durée :** 1 heure  
**Complexité :** Basse  
**Crédits :** 1,500 - 2,000
- Procédure protectedProcedure
- Validation input

#### Tâche 12 : Procédures additionnelles (2-3)
**Durée :** 2-3 heures  
**Complexité :** Basse à Moyenne  
**Crédits :** 3,500 - 5,000
- Autres procédures simples
- Fonctions DB additionnelles

**TOTAL CATÉGORIE 3 :** 10,500 - 14,500 crédits

---

### **CATÉGORIE 4 : Pages React (12,000 - 18,000 crédits)**

#### Tâche 13 : Page CagnotteBySlug.tsx
**Durée :** 2-3 heures  
**Complexité :** Moyenne (composant complet)  
**Crédits :** 6,000 - 9,000
- Composant React complet
- Utilise trpc.cagnottes.getBySlug
- Affichage détails + contributions
- Responsive mobile
- Partage social

#### Tâche 14 : Page CagnotteUpdates.tsx
**Durée :** 1,5-2 heures  
**Complexité :** Basse à Moyenne  
**Crédits :** 3,500 - 5,000
- Composant feed
- Liste chronologique
- Formulaire publication
- Responsive

#### Tâche 15 : Composants additionnels (1-2)
**Durée :** 1-2 heures  
**Complexité :** Basse  
**Crédits :** 2,500 - 4,000
- Petits composants UI
- Réutilisables

**TOTAL CATÉGORIE 4 :** 12,000 - 18,000 crédits

---

### **CATÉGORIE 5 : Tests Unitaires (10,000 - 15,000 crédits)**

#### Tâche 16 : Tests Vitest pour OTP
**Durée :** 2-3 heures  
**Complexité :** Moyenne (mocks, assertions)  
**Crédits :** 5,000 - 7,500
- Tests sendOTP()
- Tests verifyOTP()
- Tests rate limiting
- Mocks WhatsApp API
- 10-15 tests

#### Tâche 17 : Tests Vitest pour Ligidicash
**Durée :** 2-3 heures  
**Complexité :** Moyenne  
**Crédits :** 5,000 - 7,500
- Tests initiatePaiement()
- Tests verifyWebhookSignature()
- Tests parseCallback()
- Mocks Ligidicash API
- 10-15 tests

**TOTAL CATÉGORIE 5 :** 10,000 - 15,000 crédits

---

### **CATÉGORIE 6 : Documentation (8,000 - 12,000 crédits)**

#### Tâche 18 : README.md Complet
**Durée :** 2-3 heures  
**Complexité :** Basse (écriture)  
**Crédits :** 4,000 - 6,000
- Setup local
- Variables d'environnement
- Déploiement
- Procédures tRPC documentées
- Exemples d'utilisation
- Troubleshooting

#### Tâche 19 : .env.example + Documentation
**Durée :** 1 heure  
**Complexité :** Basse  
**Crédits :** 1,500 - 2,000
- Fichier .env.example complet
- Commentaires sur chaque variable
- Validation au démarrage

#### Tâche 20 : Guide Développeur Complet
**Durée :** 2 heures  
**Complexité :** Basse  
**Crédits :** 2,500 - 4,000
- Architecture expliquée
- Comment ajouter une procédure
- Comment ajouter une migration
- Points d'attention critiques

**TOTAL CATÉGORIE 6 :** 8,000 - 12,000 crédits

---

## 💰 RÉSUMÉ COÛTS PAR CATÉGORIE

| Catégorie | Crédits | USD | FCFA |
|-----------|---------|-----|------|
| Services (3) | 17,500 - 25,000 | $35 - $50 | 22,750 - 32,500 |
| Migrations & Schéma (3) | 8,500 - 13,000 | $17 - $26 | 11,050 - 16,900 |
| Procédures tRPC (4) | 10,500 - 14,500 | $21 - $29 | 13,650 - 18,850 |
| Pages React (2) | 12,000 - 18,000 | $24 - $36 | 15,600 - 23,400 |
| Tests Unitaires (2) | 10,000 - 15,000 | $20 - $30 | 13,000 - 19,500 |
| Documentation (2) | 8,000 - 12,000 | $16 - $24 | 10,400 - 15,600 |
| **TOTAL** | **66,500 - 97,500 crédits** | **$133 - $195** | **86,450 - 126,750 FCFA** |

---

## 🎯 SCÉNARIOS DE COÛTS MANUS

### **Scénario 1 : Estimation Basse (Travail Efficace)**
- **Crédits :** 66,500 crédits
- **USD :** $133
- **FCFA :** 86,450 FCFA
- **Durée :** 5 jours
- **Cas :** Manus travaille efficacement, peu de révisions

### **Scénario 2 : Estimation Moyenne (Standard)**
- **Crédits :** 82,000 crédits
- **USD :** $164
- **FCFA :** 106,600 FCFA
- **Durée :** 6 jours
- **Cas :** Révisions normales, clarifications

### **Scénario 3 : Estimation Haute (Révisions Multiples)**
- **Crédits :** 97,500 crédits
- **USD :** $195
- **FCFA :** 126,750 FCFA
- **Durée :** 7 jours
- **Cas :** Plusieurs révisions, changements de direction

---

## 📊 COMPARAISON : COÛT MANUS vs DÉVELOPPEUR

| Composant | Coût Manus | Coût Développeur | Économie |
|-----------|-----------|-----------------|----------|
| **Services** | 22,750 - 32,500 FCFA | 300,000 FCFA | 267,250 - 277,250 FCFA |
| **Migrations** | 11,050 - 16,900 FCFA | 225,000 FCFA | 208,100 - 213,950 FCFA |
| **Procédures** | 13,650 - 18,850 FCFA | 300,000 FCFA | 281,150 - 286,350 FCFA |
| **Pages React** | 15,600 - 23,400 FCFA | 300,000 FCFA | 276,600 - 284,400 FCFA |
| **Tests** | 13,000 - 19,500 FCFA | 300,000 FCFA | 280,500 - 287,000 FCFA |
| **Documentation** | 10,400 - 15,600 FCFA | 225,000 FCFA | 209,400 - 214,600 FCFA |
| **TOTAL** | **86,450 - 126,750 FCFA** | **1,650,000 FCFA** | **1,523,250 - 1,563,550 FCFA** |

**Économie totale :** 1,5M - 1,6M FCFA (94% de réduction)

---

## 💳 PLANS MANUS & CRÉDITS DISPONIBLES

### **Plans Manus Standard**

| Plan | Crédits/Mois | Coût USD/Mois | Coût FCFA/Mois |
|------|--------------|---------------|----------------|
| **Starter** | 50,000 | $9 | 11,700 |
| **Pro** | 200,000 | $29 | 37,700 |
| **Business** | 1,000,000 | $99 | 128,700 |
| **Enterprise** | Illimité | Custom | Custom |

### **Votre Projet Nécessite**

**Phase 1 (Services + Migrations + Procédures + Pages + Tests + Docs) :**
- Crédits nécessaires : 66,500 - 97,500 crédits
- Plan recommandé : **Pro (200,000 crédits/mois)** ou **Business (1M crédits/mois)**

**Avec Plan Pro :**
- Crédits disponibles : 200,000
- Crédits utilisés Phase 1 : 82,000 (estimation moyenne)
- Crédits restants : 118,000
- Suffisant pour Phase 2 + Phase 3

---

## 🎯 RECOMMANDATION

### **Approche Optimale**

**Option 1 : Plan Pro (Recommandé)**
- Coût : $29 USD/mois (37,700 FCFA)
- Crédits : 200,000/mois
- Suffisant pour : Phase 1 complète + partie Phase 2
- Économie : 1,5M FCFA sur Phase 1

**Option 2 : Plan Business**
- Coût : $99 USD/mois (128,700 FCFA)
- Crédits : 1,000,000/mois
- Suffisant pour : Phase 1 + Phase 2 + Phase 3 complètes
- Économie : 3M+ FCFA sur 3 phases

**Option 3 : Paiement à l'Usage**
- Coût : Variable selon utilisation
- Crédits : Achat au besoin
- Économie : Flexible

---

## ⏱️ TIMELINE CRÉDITS

### **Semaine 1 (Manus)**
- Crédits utilisés : 66,500 - 97,500
- Livrable : 60-70% du code Phase 1
- Coût : 86,450 - 126,750 FCFA

### **Semaines 2-3 (Développeur)**
- Crédits utilisés : 0 (développeur facturé en FCFA)
- Livrable : Intégration + tests E2E + déploiement
- Coût : 2,100,000 - 2,700,000 FCFA

### **TOTAL PHASE 1**
- Crédits Manus : 66,500 - 97,500
- Coût Manus : 86,450 - 126,750 FCFA
- Coût Développeur : 2,100,000 - 2,700,000 FCFA
- **Coût Total : 2,186,450 - 2,826,750 FCFA**
- **Économie vs Développeur seul : 600,000 - 1,200,000 FCFA**

---

## 📋 CHECKLIST AVANT DÉMARRAGE

- [ ] Vérifier votre plan Manus actuel (crédits disponibles)
- [ ] Confirmer que vous avez 66,500 - 97,500 crédits disponibles
- [ ] Ou upgrader vers Plan Pro/Business
- [ ] Valider les spécifications (WhatsApp Business, Ligidicash)
- [ ] Confirmer que je peux démarrer

---

## ✅ CONCLUSION

**Coût total Manus Phase 1 :** 86,450 - 126,750 FCFA (0.13 - 0.19 USD)

**Comparé à :**
- Développeur seul : 2,700,000 - 3,300,000 FCFA
- Manus + Développeur : 2,186,450 - 2,826,750 FCFA

**Économie globale : 600,000 - 1,200,000 FCFA (20-30%)**

**Recommandation :** Utiliser Manus pour Phase 1 = Excellent ROI

---

*Estimation réalisée le 26 février 2026*
