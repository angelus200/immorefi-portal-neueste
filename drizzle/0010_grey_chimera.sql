CREATE TABLE `customer_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`orderId` int,
	`content` text NOT NULL,
	`source` enum('ghl-import','admin','system') NOT NULL DEFAULT 'admin',
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customer_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `company` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `source` enum('portal','ghl','manual') DEFAULT 'portal' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `ghlContactId` varchar(64);