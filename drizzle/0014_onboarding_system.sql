-- Migration: Add onboarding system fields to users table
-- Created: 2026-01-13

ALTER TABLE `users`
ADD COLUMN `hasSeenWelcome` BOOLEAN NOT NULL DEFAULT FALSE AFTER `onboardingCompleted`,
ADD COLUMN `hasCompletedTour` BOOLEAN NOT NULL DEFAULT FALSE AFTER `hasSeenWelcome`,
ADD COLUMN `onboardingProgress` JSON AFTER `hasCompletedTour`;

-- Update existing users to have seen welcome (optional - remove if you want existing users to see it)
-- UPDATE `users` SET `hasSeenWelcome` = TRUE WHERE `createdAt` < NOW();
