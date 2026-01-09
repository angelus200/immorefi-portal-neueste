CREATE TABLE `invoice_counters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int,
	`year` int NOT NULL,
	`lastNumber` int NOT NULL DEFAULT 0,
	`prefix` varchar(20) NOT NULL DEFAULT 'RE',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoice_counters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoice_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceId` int NOT NULL,
	`position` int NOT NULL,
	`description` varchar(500) NOT NULL,
	`quantity` float NOT NULL DEFAULT 1,
	`unit` varchar(20) DEFAULT 'Stück',
	`unitPrice` float NOT NULL,
	`totalPrice` float NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoice_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int,
	`userId` int,
	`orderId` int,
	`contractId` int,
	`invoiceNumber` varchar(50) NOT NULL,
	`invoiceDate` timestamp NOT NULL,
	`dueDate` timestamp,
	`invoiceType` enum('analysis','shop','installment','final','credit_note') NOT NULL DEFAULT 'shop',
	`invoiceStatus` enum('draft','sent','paid','overdue','cancelled') NOT NULL DEFAULT 'draft',
	`customerName` varchar(255) NOT NULL,
	`customerEmail` varchar(320),
	`customerCompany` varchar(255),
	`customerAddress` text,
	`customerVatId` varchar(50),
	`description` text,
	`netAmount` float NOT NULL,
	`vatRate` float NOT NULL DEFAULT 7.7,
	`vatAmount` float NOT NULL,
	`grossAmount` float NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'CHF',
	`installmentNumber` int,
	`totalInstallments` int,
	`pdfFileKey` varchar(500),
	`pdfUrl` text,
	`paidAt` timestamp,
	`paymentMethod` varchar(50),
	`paymentReference` varchar(255),
	`notes` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
