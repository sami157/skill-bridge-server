/**
 * One-time migration: fix bookings where tutorId was wrongly stored as User.id.
 * Sets booking.tutorId to the corresponding TutorProfile.id.
 * Run from server root: npx tsx src/scripts/fix-booking-tutor-ids.ts
 */

import { prisma } from "../lib/prisma";

const SQL = `
  UPDATE bookings b
  SET "tutorId" = tp.id
  FROM tutor_profiles tp
  WHERE tp."userId" = b."tutorId"
    AND b."tutorId" IN (SELECT id FROM users)
`;

async function main() {
  const result = await prisma.$executeRawUnsafe(SQL);
  console.log(`Fixed ${result} booking(s) where tutorId was stored as User.id.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
