CREATE TABLE `download_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`productType` varchar(50) NOT NULL,
	`productName` varchar(255) NOT NULL,
	`ipAddress` varchar(45),
	`userAgent` text,
	`referrer` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `download_stats_id` PRIMARY KEY(`id`)
);
