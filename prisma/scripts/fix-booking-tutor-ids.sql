-- One-time fix: set bookings.tutorId to TutorProfile.id where it was wrongly stored as User.id.
-- Run once after deploying the booking fix. Safe to run multiple times (no-op if already correct).
--
-- Option 1: From server root: npm run fix-booking-tutor-ids  (runs the TS script with Prisma)
-- Option 2: With psql: psql $DATABASE_URL -f prisma/scripts/fix-booking-tutor-ids.sql

UPDATE bookings b
SET "tutorId" = tp.id
FROM tutor_profiles tp
WHERE tp."userId" = b."tutorId"
  AND b."tutorId" IN (SELECT id FROM users);
