-- Migration: Add email notification preferences to users table
-- Created: 2026-01-19
-- Fix: BUG-011 - E-Mail Einstellungen speichern nicht

ALTER TABLE `users`
ADD COLUMN `emailNotifications` BOOLEAN NOT NULL DEFAULT TRUE AFTER `onboardingProgress`,
ADD COLUMN `marketingEmails` BOOLEAN NOT NULL DEFAULT FALSE AFTER `emailNotifications`;
