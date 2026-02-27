-- Migration 0002 — Terra Biga v2
-- Adds: cagnotte slug, nullable targetAmount, isPaused, cagnotte_updates table, freemium_payments table
-- Updates: cagnotte status enum (adds pending_payment), payments type enum (adds creation_fee)

-- 1. Add slug column to cagnottes (nullable initially, backfilled via app)
ALTER TABLE `cagnottes` ADD `slug` varchar(255);
--> statement-breakpoint
ALTER TABLE `cagnottes` ADD UNIQUE INDEX `cagnottes_slug_unique` (`slug`);
--> statement-breakpoint

-- 2. Make targetAmount nullable (objectif optionnel — style GoFundMe)
ALTER TABLE `cagnottes` MODIFY COLUMN `targetAmount` int NULL;
--> statement-breakpoint

-- 3. Add isPaused flag
ALTER TABLE `cagnottes` ADD `isPaused` boolean NOT NULL DEFAULT false;
--> statement-breakpoint

-- 4. Add imageUrl for cover photo
ALTER TABLE `cagnottes` ADD `imageUrl` text;
--> statement-breakpoint

-- 5. Extend status enum to include pending_payment
ALTER TABLE `cagnottes` MODIFY COLUMN `status`
  enum('active','pending_review','pending_payment','completed','paused','rejected')
  NOT NULL DEFAULT 'active';
--> statement-breakpoint

-- 6. Extend payments type enum to include creation_fee
ALTER TABLE `payments` MODIFY COLUMN `type`
  enum('advance','remaining','contribution','donation','creation_fee')
  NOT NULL;
--> statement-breakpoint

-- 7. Add metadata column to payments for tracing (cagnotteId etc.)
ALTER TABLE `payments` ADD `metadata` json;
--> statement-breakpoint

-- 8. Create cagnotte_updates table (porteur feed)
CREATE TABLE `cagnotte_updates` (
  `id` int AUTO_INCREMENT NOT NULL,
  `cagnotteId` int NOT NULL,
  `userId` int,
  `content` text NOT NULL,
  `imageUrl` text,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `cagnotte_updates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint

-- 9. Create freemium_payments table — tracks 500 FCFA creation fees
CREATE TABLE `freemium_payments` (
  `id` int AUTO_INCREMENT NOT NULL,
  `phone` varchar(20) NOT NULL,
  `userId` int,
  `paymentId` int,
  `cagnotteId` int,
  `status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `freemium_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint

-- 10. OTP rate-limit table (tracks attempt counts per phone per window)
CREATE TABLE `otp_attempts` (
  `id` int AUTO_INCREMENT NOT NULL,
  `phone` varchar(20) NOT NULL,
  `attempts` int NOT NULL DEFAULT 1,
  `windowStart` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `otp_attempts_id` PRIMARY KEY(`id`)
);
