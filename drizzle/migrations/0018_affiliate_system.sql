-- Affiliate System Migration
-- Erstellt 3 neue Tabellen für das Affiliate-Programm

-- 1. Affiliate Profiles
CREATE TABLE IF NOT EXISTS `affiliate_profiles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `clerkUserId` VARCHAR(255) NOT NULL UNIQUE,
  `affiliateCode` VARCHAR(20) NOT NULL UNIQUE,
  `status` ENUM('active', 'paused', 'banned') NOT NULL DEFAULT 'active',
  `payoutMethod` ENUM('bank_transfer', 'paypal') NOT NULL DEFAULT 'bank_transfer',
  `payoutDetails` TEXT,
  `totalEarned` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `totalPaid` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_clerk_user` (`clerkUserId`),
  INDEX `idx_affiliate_code` (`affiliateCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Affiliate Referrals
CREATE TABLE IF NOT EXISTS `affiliate_referrals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `affiliateId` INT NOT NULL,
  `referredUserId` VARCHAR(255),
  `cookieToken` VARCHAR(255),
  `landedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `convertedAt` TIMESTAMP NULL,
  `status` ENUM('clicked', 'registered', 'converted', 'expired') NOT NULL DEFAULT 'clicked',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_affiliate` (`affiliateId`),
  INDEX `idx_referred_user` (`referredUserId`),
  INDEX `idx_cookie_token` (`cookieToken`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`affiliateId`) REFERENCES `affiliate_profiles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Affiliate Commissions
CREATE TABLE IF NOT EXISTS `affiliate_commissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `affiliateId` INT NOT NULL,
  `referralId` INT NOT NULL,
  `stripeSessionId` VARCHAR(255) NOT NULL,
  `productType` ENUM('analyse', 'erstberatung') NOT NULL,
  `orderAmount` DECIMAL(10,2) NOT NULL,
  `commissionRate` DECIMAL(4,2) NOT NULL DEFAULT 5.00,
  `commissionAmount` DECIMAL(10,2) NOT NULL,
  `status` ENUM('pending', 'approved', 'paid', 'cancelled') NOT NULL DEFAULT 'pending',
  `paidAt` TIMESTAMP NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_affiliate` (`affiliateId`),
  INDEX `idx_referral` (`referralId`),
  INDEX `idx_stripe_session` (`stripeSessionId`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`affiliateId`) REFERENCES `affiliate_profiles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`referralId`) REFERENCES `affiliate_referrals`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
