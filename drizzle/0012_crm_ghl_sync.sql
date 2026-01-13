-- CRM Schema Extensions for GoHighLevel Sync
-- Migration: 0012_crm_ghl_sync

-- Extend leads table for full CRM functionality
ALTER TABLE `leads` ADD COLUMN `ghlContactId` varchar(64);
ALTER TABLE `leads` ADD COLUMN `name` varchar(255) NOT NULL DEFAULT '';
ALTER TABLE `leads` ADD COLUMN `email` varchar(320);
ALTER TABLE `leads` ADD COLUMN `phone` varchar(32);
ALTER TABLE `leads` ADD COLUMN `company` varchar(255);
ALTER TABLE `leads` ADD COLUMN `capitalNeed` varchar(100);
ALTER TABLE `leads` ADD COLUMN `timeHorizon` varchar(100);
ALTER TABLE `leads` ADD COLUMN `description` text;
ALTER TABLE `leads` ADD COLUMN `notes` text;
ALTER TABLE `leads` ADD COLUMN `assignedTo` int;
ALTER TABLE `leads` ADD COLUMN `lastSyncedAt` timestamp;

-- Extend contacts table
ALTER TABLE `contacts` ADD COLUMN `ghlContactId` varchar(64);
ALTER TABLE `contacts` ADD COLUMN `type` enum('kunde','partner','lieferant') DEFAULT 'kunde' NOT NULL;
ALTER TABLE `contacts` ADD COLUMN `street` varchar(255);
ALTER TABLE `contacts` ADD COLUMN `zip` varchar(20);
ALTER TABLE `contacts` ADD COLUMN `city` varchar(100);
ALTER TABLE `contacts` ADD COLUMN `website` varchar(255);
ALTER TABLE `contacts` ADD COLUMN `notes` text;
ALTER TABLE `contacts` ADD COLUMN `lastSyncedAt` timestamp;

-- Extend deals table
ALTER TABLE `deals` ADD COLUMN `ghlOpportunityId` varchar(64);
ALTER TABLE `deals` ADD COLUMN `leadId` int;
ALTER TABLE `deals` ADD COLUMN `stage` enum('new','qualified','proposal','negotiation','won','lost') DEFAULT 'new' NOT NULL;
ALTER TABLE `deals` ADD COLUMN `assignedTo` int;
ALTER TABLE `deals` ADD COLUMN `name` varchar(255) NOT NULL DEFAULT '';
ALTER TABLE `deals` ADD COLUMN `probability` int DEFAULT 0;
ALTER TABLE `deals` ADD COLUMN `expectedCloseDate` timestamp;
ALTER TABLE `deals` ADD COLUMN `notes` text;
ALTER TABLE `deals` ADD COLUMN `lastSyncedAt` timestamp;
