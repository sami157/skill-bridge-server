/**
 * Check bookings and tutor data; fix wrong tutorIds then show upcoming sessions per tutor.
 * Run from server root: npx tsx src/scripts/check-tutor-upcoming.ts
 */

import { prisma } from "../lib/prisma";

const FIX_SQL = `
  UPDATE bookings b
  SET "tutorId" = tp.id
  FROM tutor_profiles tp
  WHERE tp."userId" = b."tutorId"
    AND b."tutorId" IN (SELECT id FROM users)
`;

async function main() {
  // 1) List all bookings and tutor_profiles
  const bookings = await prisma.booking.findMany({
    orderBy: { startTime: "asc" },
    include: {
      student: { select: { id: true, name: true } },
      tutor: { select: { id: true, userId: true, user: { select: { name: true } } } },
    },
  });
  const profiles = await prisma.tutorProfile.findMany({
    select: { id: true, userId: true, user: { select: { name: true } } },
  });
  const userIds = new Set(profiles.map((p) => p.userId));
  const profileIds = new Set(profiles.map((p) => p.id));

  console.log("--- Tutor profiles (id, userId, name) ---");
  profiles.forEach((p) => console.log(`  ${p.id}  userId=${p.userId}  ${p.user.name}`));
  console.log("\n--- Bookings (id, tutorId, startTime, status) ---");
  bookings.forEach((b) => {
    const wrong = userIds.has(b.tutorId) && !profileIds.has(b.tutorId);
    console.log(`  ${b.id}  tutorId=${b.tutorId}  ${b.startTime.toISOString()}  ${b.status}  ${wrong ? " WRONG (userId stored)" : ""}`);
  });

  // 2) Fix wrong tutorIds (where tutorId is a User.id)
  const fixed = await prisma.$executeRawUnsafe(FIX_SQL);
  if (fixed > 0) console.log(`\nFixed ${fixed} booking(s) where tutorId was User.id.`);

  // 3) For each tutor (by userId), get upcoming sessions same way as GET /bookings/tutor
  console.log("\n--- Upcoming sessions per tutor (userId -> count) ---");
  const now = new Date();
  for (const p of profiles) {
    const tutorBookings = await prisma.booking.findMany({
      where: { tutorId: p.id },
      orderBy: { startTime: "asc" },
      include: {
        student: { select: { name: true } },
      },
    });
    const upcoming = tutorBookings.filter(
      (b) => b.status === "CONFIRMED" && new Date(b.endTime) > now
    );
    console.log(`  Tutor ${p.user.name} (userId=${p.userId}, profileId=${p.id}): ${upcoming.length} upcoming of ${tutorBookings.length} total`);
    upcoming.forEach((b) =>
      console.log(`    - ${b.startTime.toISOString()} with ${b.student.name}`)
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
