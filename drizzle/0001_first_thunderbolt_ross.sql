CREATE TABLE `admin_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_config_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_config_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `cagnottes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100) NOT NULL,
	`carrierType` varchar(50),
	`targetAmount` int NOT NULL,
	`currentAmount` int NOT NULL DEFAULT 0,
	`contributorsCount` int NOT NULL DEFAULT 0,
	`mobileMoneyNumber` varchar(20),
	`status` enum('active','pending_review','completed','rejected') NOT NULL DEFAULT 'active',
	`rejectionReason` text,
	`healthData` json,
	`ngoData` json,
	`creatorPhone` varchar(20),
	`creatorName` varchar(255),
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cagnottes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contributions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cagnotteId` int NOT NULL,
	`userId` int,
	`contributorName` varchar(255),
	`contributorPhone` varchar(20),
	`amount` int NOT NULL,
	`message` text,
	`paymentMethod` varchar(30),
	`paymentStatus` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`isAnonymous` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contributions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `donations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`donorName` varchar(255),
	`donorPhone` varchar(20),
	`amount` int NOT NULL,
	`paymentMethod` varchar(30),
	`paymentStatus` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `donations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `groups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`currentMembers` int NOT NULL DEFAULT 0,
	`maxMembers` int NOT NULL DEFAULT 50,
	`status` enum('forming','full','ordered','ready','completed') NOT NULL DEFAULT 'forming',
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `groups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `identities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`orderId` int,
	`fullName` varchar(255) NOT NULL,
	`firstName` varchar(255),
	`documentType` enum('cni','passport','permit') NOT NULL,
	`documentNumber` varchar(100) NOT NULL,
	`documentImageUrl` text,
	`phone` varchar(20),
	`status` enum('pending','verified','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `identities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`groupId` int NOT NULL,
	`productId` int NOT NULL,
	`orderCode` varchar(20) NOT NULL,
	`advanceAmount` int NOT NULL,
	`remainingAmount` int NOT NULL,
	`totalAmount` int NOT NULL,
	`paymentMethod` varchar(30),
	`paymentStatus` enum('pending','advance_paid','fully_paid','failed') NOT NULL DEFAULT 'pending',
	`identityStatus` enum('pending','verified','rejected') NOT NULL DEFAULT 'pending',
	`collectionStatus` enum('waiting','ready','collected') NOT NULL DEFAULT 'waiting',
	`customerPhone` varchar(20),
	`customerName` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderCode_unique` UNIQUE(`orderCode`)
);
--> statement-breakpoint
CREATE TABLE `otp_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phone` varchar(20) NOT NULL,
	`code` varchar(6) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`used` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `otp_codes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('advance','remaining','contribution','donation') NOT NULL,
	`referenceId` int,
	`amount` int NOT NULL,
	`method` enum('ussd_orange','ussd_moov','ligidicash') NOT NULL,
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`providerTransactionId` varchar(255),
	`phone` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `point_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`points` int NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `point_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`contents` json,
	`category` varchar(100),
	`standardPrice` int NOT NULL,
	`groupPrice` int NOT NULL,
	`discount` int DEFAULT 0,
	`groupSize` int DEFAULT 50,
	`imageUrl` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','super_admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `firstName` text;--> statement-breakpoint
ALTER TABLE `users` ADD `lastName` text;--> statement-breakpoint
ALTER TABLE `users` ADD `points` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `level` enum('bronze','silver','gold','platinum') DEFAULT 'bronze' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `referralCode` varchar(16);--> statement-breakpoint
ALTER TABLE `users` ADD `referredBy` varchar(16);--> statement-breakpoint
ALTER TABLE `users` ADD `language` varchar(5) DEFAULT 'fr';--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;