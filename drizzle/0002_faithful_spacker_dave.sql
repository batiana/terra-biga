ALTER TABLE `cagnottes` MODIFY COLUMN `status` enum('active','pending_review','paused','completed','rejected') NOT NULL DEFAULT 'active';--> statement-breakpoint
ALTER TABLE `groups` MODIFY COLUMN `status` enum('forming','open','full','balance_pending','ordered','delivered','completed') NOT NULL DEFAULT 'open';--> statement-breakpoint
ALTER TABLE `otp_attempts` MODIFY COLUMN `windowStart` timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE `payments` MODIFY COLUMN `type` enum('advance','remaining','contribution','donation','fee_cagnotte') NOT NULL;--> statement-breakpoint
ALTER TABLE `payments` MODIFY COLUMN `status` enum('pending','completed','failed','cancelled') NOT NULL DEFAULT 'pending';--> statement-breakpoint


ALTER TABLE `payments` ADD `ligdicashToken` varchar(512);--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_providerTransactionId_unique` UNIQUE(`providerTransactionId`);