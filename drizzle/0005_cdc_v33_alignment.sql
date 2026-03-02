ALTER TABLE `identities`
  ADD COLUMN `documentExpiry` timestamp NULL;

ALTER TABLE `cagnottes`
  ADD COLUMN `type` enum('private','ong') NOT NULL DEFAULT 'private',
  ADD COLUMN `organizationId` int NULL,
  ADD COLUMN `approvalStatus` enum('pending','approved','rejected') NOT NULL DEFAULT 'approved';

CREATE TABLE `organizations` (
  `id` int AUTO_INCREMENT NOT NULL,
  `name` varchar(255) NOT NULL,
  `legalRepresentative` varchar(255) NOT NULL,
  `registrationNumber` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(320) NOT NULL,
  `address` text NOT NULL,
  `description` text,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `organizations_id` PRIMARY KEY(`id`)
);

CREATE TABLE `group_proposals` (
  `id` int AUTO_INCREMENT NOT NULL,
  `productId` int NOT NULL,
  `userId` int,
  `title` varchar(255) NOT NULL,
  `description` text,
  `proposedMaxMembers` int,
  `votes` int NOT NULL DEFAULT 0,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `group_proposals_id` PRIMARY KEY(`id`)
);
