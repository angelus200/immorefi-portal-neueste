CREATE TABLE `contract_acceptances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assignmentId` int NOT NULL,
	`contractId` int NOT NULL,
	`userId` int NOT NULL,
	`tenantId` int NOT NULL,
	`acceptedAt` timestamp NOT NULL,
	`ipAddress` varchar(45),
	`userAgent` text,
	`confirmationText` text NOT NULL,
	`contractVersion` varchar(20) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contract_acceptances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contract_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contractId` int NOT NULL,
	`userId` int NOT NULL,
	`tenantId` int NOT NULL,
	`assignedBy` int NOT NULL,
	`note` text,
	`dueDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contract_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`contractType` enum('analysis','fund_structuring','cln_amc','mandate','nda','other') NOT NULL DEFAULT 'other',
	`description` text,
	`fileKey` varchar(500) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`version` varchar(20) NOT NULL DEFAULT '1.0',
	`contractStatus` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
	`governingLaw` varchar(100) DEFAULT 'Schweizer Recht',
	`arbitrationClause` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contracts_id` PRIMARY KEY(`id`)
);
