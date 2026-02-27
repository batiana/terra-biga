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
CREATE TABLE `otp_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phone` varchar(20) NOT NULL,
	`attempts` int NOT NULL DEFAULT 1,
	`windowStart` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `otp_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `cagnottes` MODIFY COLUMN `targetAmount` int;--> statement-breakpoint
ALTER TABLE `cagnottes` MODIFY COLUMN `status` enum('active','pending_review','pending_payment','completed','paused','rejected') NOT NULL DEFAULT 'active';--> statement-breakpoint
ALTER TABLE `payments` MODIFY COLUMN `type` enum('advance','remaining','contribution','donation','creation_fee') NOT NULL;--> statement-breakpoint
ALTER TABLE `cagnottes` ADD `slug` varchar(255);--> statement-breakpoint

ALTER TABLE `cagnottes` ADD `isPaused` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `payments` ADD `metadata` json;--> statement-breakpoint
ALTER TABLE `cagnottes` ADD CONSTRAINT `cagnottes_slug_unique` UNIQUE(`slug`);