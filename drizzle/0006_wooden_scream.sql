CREATE TABLE `onboarding_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`onboardingId` int NOT NULL,
	`userId` int NOT NULL,
	`onboardingDocCategory` enum('jahresabschluss','bwa','objektliste','mieterliste','finanzierungen','wertgutachten','gesellschaftsvertrag','sonstige') NOT NULL DEFAULT 'sonstige',
	`fileName` varchar(255) NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`fileUrl` text NOT NULL,
	`mimeType` varchar(100),
	`size` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `onboarding_documents_id` PRIMARY KEY(`id`)
);
