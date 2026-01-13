-- Migration: Booking System (Staff Calendars & Bookings)

-- Create bookingStatus enum
CREATE TABLE IF NOT EXISTS `_bookingStatus_enum_tmp` (
  `value` ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show') NOT NULL
);

-- Create staff_calendars table
CREATE TABLE IF NOT EXISTS `staff_calendars` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `oderId` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `calendlyUrl` VARCHAR(500),
  `avatarUrl` VARCHAR(500),
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `oderId` INT NOT NULL,
  `staffCalendarId` INT NOT NULL,
  `calendlyEventId` VARCHAR(100),
  `calendlyInviteeId` VARCHAR(100),
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `startTime` TIMESTAMP NOT NULL,
  `endTime` TIMESTAMP NOT NULL,
  `meetingUrl` VARCHAR(500),
  `status` ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show') NOT NULL DEFAULT 'pending',
  `customerNotes` TEXT,
  `reminder24hSent` BOOLEAN NOT NULL DEFAULT FALSE,
  `reminder1hSent` BOOLEAN NOT NULL DEFAULT FALSE,
  `reminderSmsSent` BOOLEAN NOT NULL DEFAULT FALSE,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_bookings_oderId` (`oderId`),
  INDEX `idx_bookings_staffCalendarId` (`staffCalendarId`),
  INDEX `idx_bookings_startTime` (`startTime`),
  INDEX `idx_bookings_status` (`status`)
);
