-- ============================================================================
-- Migration 0002 — Intégration Ligdicash + corrections CDC
-- Créée le : 2026-02-26
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- TABLE : payments
-- ────────────────────────────────────────────────────────────────────────────

-- Ajout du token JWT Ligdicash (clé de recherche pour les webhooks)
ALTER TABLE `payments`
  ADD COLUMN `ligdicashToken` VARCHAR(512) NULL AFTER `status`;

-- Ajout de l'horodatage de confirmation côté Ligdicash
ALTER TABLE `payments`
  ADD COLUMN `confirmedAt` TIMESTAMP NULL AFTER `providerTransactionId`;

-- Contrainte UNIQUE sur providerTransactionId pour l'idempotence absolue
-- Les anciens enregistrements SIM-XXXXXXXX ne doivent pas bloquer :
-- d'abord les effacer ou les mettre à NULL
UPDATE `payments`
  SET `providerTransactionId` = NULL
  WHERE `providerTransactionId` LIKE 'SIM-%';

-- Appliquer la contrainte UNIQUE
-- Note : UNIQUE permet NULL multiples en MySQL (comportement attendu)
ALTER TABLE `payments`
  ADD UNIQUE INDEX `uq_payments_provider_tx_id` (`providerTransactionId`);

-- Index sur ligdicashToken pour recherche rapide dans le webhook handler
CREATE INDEX `idx_payments_ligdicash_token`
  ON `payments` (`ligdicashToken`(255));

-- Index sur status pour les requêtes admin et monitoring
CREATE INDEX `idx_payments_status`
  ON `payments` (`status`);

-- ────────────────────────────────────────────────────────────────────────────
-- TABLE : cagnottes
-- ────────────────────────────────────────────────────────────────────────────

-- Slug URL court unique (ex: "aidons-fatimata-xk7p" → /c/aidons-fatimata-xk7p)
ALTER TABLE `cagnottes`
  ADD COLUMN `slug` VARCHAR(255) NULL AFTER `title`;

-- Rendre targetAmount optionnel (CDC §4.1 : "objectif optionnel")
ALTER TABLE `cagnottes`
  MODIFY COLUMN `targetAmount` INT NULL;

-- Traçabilité du paiement des frais freemium (500 FCFA après 3 gratuites)
ALTER TABLE `cagnottes`
  ADD COLUMN `freemiumFeesPaid` BOOLEAN NOT NULL DEFAULT FALSE AFTER `creatorName`;

-- Points BIGA Phase 1 : champs présents mais logique inactive jusqu'en Phase 3
-- CDC §10.3 note : "stocker dès Phase 1 à 0 par défaut"
ALTER TABLE `cagnottes`
  ADD COLUMN `bigaPointsMam` INT NOT NULL DEFAULT 0 AFTER `freemiumFeesPaid`,
  ADD COLUMN `bigaPointsTe` INT NOT NULL DEFAULT 0 AFTER `bigaPointsMam`;

-- Contrainte UNIQUE sur slug (après ajout de la colonne)
ALTER TABLE `cagnottes`
  ADD UNIQUE INDEX `uq_cagnottes_slug` (`slug`);

-- Générer des slugs temporaires pour les cagnottes existantes
-- (le code applicatif générera les vrais slugs à la création)
UPDATE `cagnottes`
  SET `slug` = CONCAT('cagnotte-', id, '-', SUBSTRING(MD5(RAND()), 1, 4))
  WHERE `slug` IS NULL;

-- ────────────────────────────────────────────────────────────────────────────
-- TABLE : users
-- Points BIGA Phase 1 : stocker les champs dès maintenant (CDC §10)
-- ────────────────────────────────────────────────────────────────────────────

-- Vérification : les colonnes points et level existent déjà (voir schema.ts)
-- Si elles n'existent pas encore :
-- ALTER TABLE `users` ADD COLUMN `bigaPointsTe` INT NOT NULL DEFAULT 0;
-- ALTER TABLE `users` ADD COLUMN `bigaPointsMam` INT NOT NULL DEFAULT 0;

-- ────────────────────────────────────────────────────────────────────────────
-- TABLE : cagnotte_updates (nouvelle table — CDC §4.4 feed mises à jour)
-- Phase 2 — implémentation logique en Phase 2
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `cagnotte_updates` (
  `id`          INT AUTO_INCREMENT PRIMARY KEY,
  `cagnotteId`  INT NOT NULL,
  `userId`      INT NULL,
  `title`       VARCHAR(255) NULL,
  `content`     TEXT NOT NULL,
  `imageUrl`    TEXT NULL,
  `createdAt`   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_cagnotte_updates_cagnotte` (`cagnotteId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- FIN DE LA MIGRATION
-- Pour appliquer : pnpm run db:push (si Drizzle) ou exécuter manuellement
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- AJOUTS V3.3 (corrections TypeScript — audit complet)
-- ────────────────────────────────────────────────────────────────────────────

-- cagnottes.imageUrl — photo de la cagnotte
ALTER TABLE `cagnottes`
  ADD COLUMN `imageUrl` TEXT NULL AFTER `creatorName`;

-- cagnottes.isPaused — alias boolean du statut paused
ALTER TABLE `cagnottes`
  ADD COLUMN `isPaused` BOOLEAN NOT NULL DEFAULT FALSE AFTER `imageUrl`;

-- payments.metadata — données JSON libres (ex: pendingCagnotte pour fee_cagnotte)
ALTER TABLE `payments`
  ADD COLUMN `metadata` JSON NULL AFTER `ligdicashToken`;

-- otp_codes.attempts — compteur de mauvais codes
ALTER TABLE `otp_codes`
  ADD COLUMN `attempts` INT NOT NULL DEFAULT 0 AFTER `used`;

-- TABLE otp_attempts (rate limiting par téléphone + fenêtre glissante)
CREATE TABLE IF NOT EXISTS `otp_attempts` (
  `id`          INT AUTO_INCREMENT PRIMARY KEY,
  `phone`       VARCHAR(20) NOT NULL,
  `attempts`    INT NOT NULL DEFAULT 1,
  `windowStart` TIMESTAMP NOT NULL,
  `createdAt`   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_otp_attempts_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
