-- Normalize missing phones first
UPDATE `users`
SET `phone` = CONCAT('legacy_', LPAD(`id`, 12, '0'))
WHERE `phone` IS NULL OR `phone` = '';

-- Deduplicate phones by keeping most recent lastSignedIn/updatedAt/id
WITH ranked AS (
  SELECT
    `id`,
    ROW_NUMBER() OVER (
      PARTITION BY `phone`
      ORDER BY `lastSignedIn` DESC, `updatedAt` DESC, `id` DESC
    ) AS rn
  FROM `users`
)
UPDATE `users` u
JOIN ranked r ON r.id = u.id
SET u.`phone` = CONCAT('legacy_', LPAD(u.`id`, 12, '0'))
WHERE r.rn > 1;

ALTER TABLE `users`
  MODIFY COLUMN `phone` varchar(20) NOT NULL;

CREATE UNIQUE INDEX `users_phone_unique` ON `users` (`phone`);

ALTER TABLE `donations`
  ADD COLUMN `cagnotteId` int NULL;

CREATE TABLE `projects` (
  `id` int AUTO_INCREMENT NOT NULL,
  `organizationId` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `targetAmount` int,
  `status` enum('SUBMITTED','APPROVED','REJECTED') NOT NULL DEFAULT 'SUBMITTED',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);

CREATE TABLE `admin_otp_codes` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `code` varchar(6) NOT NULL,
  `expiresAt` timestamp NOT NULL,
  `used` boolean NOT NULL DEFAULT false,
  `attempts` int NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `admin_otp_codes_id` PRIMARY KEY(`id`)
);

CREATE TABLE `audit_logs` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int,
  `action` varchar(100) NOT NULL,
  `entity` varchar(100) NOT NULL,
  `entityId` int,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
