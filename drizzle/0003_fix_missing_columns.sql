-- Fix missing columns for cagnottes table
-- This migration adds only the columns that are missing

ALTER TABLE `cagnottes` MODIFY COLUMN `targetAmount` int;
ALTER TABLE `cagnottes` MODIFY COLUMN `status` enum('active','pending_review','pending_payment','completed','paused','rejected') NOT NULL DEFAULT 'active';
ALTER TABLE `payments` MODIFY COLUMN `type` enum('advance','remaining','contribution','donation','creation_fee') NOT NULL;

-- Add missing columns if they don't exist
ALTER TABLE `cagnottes` ADD COLUMN `slug` varchar(255) UNIQUE;
ALTER TABLE `cagnottes` ADD COLUMN `isPaused` boolean DEFAULT false NOT NULL;
ALTER TABLE `payments` ADD COLUMN `metadata` json;

-- Add unique constraint on slug
ALTER TABLE `cagnottes` ADD CONSTRAINT `cagnottes_slug_unique` UNIQUE(`slug`);
