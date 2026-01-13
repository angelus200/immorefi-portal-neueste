-- Migration: Add contract_templates table
-- Created: 2026-01-13

CREATE TABLE `contract_templates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `category` VARCHAR(100) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `placeholders` JSON,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX `idx_contract_templates_category` ON `contract_templates` (`category`);
CREATE INDEX `idx_contract_templates_active` ON `contract_templates` (`isActive`);
