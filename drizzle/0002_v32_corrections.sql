-- ─── Migration V3.2 → V3.3 ────────────────────────────────────────────────────
-- À appliquer après 0001_first_thunderbolt_ross.sql
-- Commande : pnpm run db:push  OU  mysql -u root terra_biga < drizzle/0002_v32_corrections.sql

-- 1. Table `groups` : corriger l'enum status
--    "forming" → "open"  +  ajouter "balance_pending" et "delivered"
ALTER TABLE `groups` MODIFY COLUMN `status`
  ENUM('open','full','balance_pending','ordered','delivered','completed')
  NOT NULL DEFAULT 'open';

-- Migrer les données existantes (forming → open)
UPDATE `groups` SET `status` = 'open' WHERE `status` = 'forming';

-- 2. Table `cagnottes` : ajouter slug, rendre targetAmount nullable,
--    ajouter statut "paused", colonnes freemium
ALTER TABLE `cagnottes`
  ADD COLUMN `slug` VARCHAR(255) UNIQUE AFTER `userId`,
  MODIFY COLUMN `targetAmount` INT NULL DEFAULT NULL,
  MODIFY COLUMN `status`
    ENUM('active','pending_review','paused','completed','rejected')
    NOT NULL DEFAULT 'active',
  ADD COLUMN `feesPaidAt` TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN `feePaymentToken` VARCHAR(255) NULL DEFAULT NULL;

-- Générer des slugs pour les cagnottes existantes sans slug
UPDATE `cagnottes`
SET `slug` = CONCAT(
  LOWER(REGEXP_REPLACE(REPLACE(REPLACE(REPLACE(title, ' ', '-'), 'é', 'e'), 'è', 'e'), '[^a-z0-9-]', '')),
  '-',
  SUBSTRING(MD5(RAND()), 1, 4)
)
WHERE `slug` IS NULL;

-- 3. Table `payments` : ajouter fee_cagnotte type, cancelled status,
--    ligdicashToken, et contrainte UNIQUE sur providerTransactionId
ALTER TABLE `payments`
  MODIFY COLUMN `type`
    ENUM('advance','remaining','contribution','donation','fee_cagnotte')
    NOT NULL,
  MODIFY COLUMN `status`
    ENUM('pending','completed','failed','cancelled')
    NOT NULL DEFAULT 'pending',
  ADD COLUMN `ligdicashToken` VARCHAR(512) NULL DEFAULT NULL,
  ADD UNIQUE INDEX `uq_payments_providerTxId` (`providerTransactionId`);

-- Fin de migration
