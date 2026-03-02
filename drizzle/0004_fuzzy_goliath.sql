ALTER TABLE `otp_attempts` MODIFY COLUMN `windowStart` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `payments` ADD `storeReference` varchar(255);