-- Partner Logos Table for Logo Management System
CREATE TABLE `partner_logos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` ENUM('presse', 'mitgliedschaft', 'auszeichnung', 'partner') NOT NULL,
  `imageUrl` VARCHAR(500) NOT NULL,
  `linkUrl` VARCHAR(500),
  `sortOrder` INT NOT NULL DEFAULT 0,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX `idx_partner_logos_category` ON `partner_logos` (`category`);
CREATE INDEX `idx_partner_logos_active` ON `partner_logos` (`isActive`);
CREATE INDEX `idx_partner_logos_sort` ON `partner_logos` (`sortOrder`);
