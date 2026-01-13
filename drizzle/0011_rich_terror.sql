ALTER TABLE `users` ADD `street` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `zip` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `city` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `country` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `website` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `userStatus` enum('active','inactive','blocked') DEFAULT 'active' NOT NULL;