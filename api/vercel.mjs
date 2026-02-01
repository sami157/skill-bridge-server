// src/app.ts
import { toNodeHandler } from "better-auth/node";
import express5 from "express";

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// generated/prisma/client.ts
import "process";
import * as path from "path";
import { fileURLToPath } from "url";
import "@prisma/client/runtime/client";

// generated/prisma/enums.ts
var Role = {
  STUDENT: "STUDENT",
  TUTOR: "TUTOR",
  ADMIN: "ADMIN"
};
var BookingStatus = {
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED"
};

// generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.3.0",
  "engineVersion": "9d6ad21cbbceab97458517b147a6a09ff43aa735",
  "activeProvider": "postgresql",
  "inlineSchema": '// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nenum Role {\n  STUDENT\n  TUTOR\n  ADMIN\n}\n\nenum BookingStatus {\n  CONFIRMED\n  COMPLETED\n  CANCELLED\n}\n\nmodel User {\n  id                String        @id @default(uuid())\n  name              String        @db.VarChar(200)\n  email             String        @unique\n  phone             String?       @db.VarChar(14)\n  role              Role          @default(STUDENT)\n  active            Boolean       @default(true)\n  tutorProfile      TutorProfile?\n  bookingsAsStudent Booking[]\n  createdAt         DateTime      @default(now())\n  updatedAt         DateTime      @updatedAt\n  emailVerified     Boolean       @default(false)\n  image             String?\n  sessions          Session[]\n  accounts          Account[]\n\n  @@map("users")\n}\n\nmodel TutorProfile {\n  id              String    @id @default(uuid())\n  user            User      @relation(fields: [userId], references: [id])\n  userId          String    @unique\n  bio             String?\n  subjects        Subject[]\n  bookingsAsTutor Booking[]\n  availability    Json?\n  pricePerHour    Float\n  reviewCount     Int       @default(0)\n  rating          Float     @default(0)\n\n  @@map("tutor_profiles")\n}\n\nmodel Category {\n  id       String    @id @default(uuid())\n  name     String    @unique\n  subjects Subject[]\n\n  @@map("categories")\n}\n\nmodel Subject {\n  id         String         @id @default(uuid())\n  name       String         @unique\n  category   Category       @relation(fields: [categoryId], references: [id])\n  categoryId String\n  tutors     TutorProfile[]\n\n  @@map("subjects")\n}\n\nmodel Booking {\n  id        String        @id @default(uuid())\n  studentId String\n  student   User          @relation(fields: [studentId], references: [id])\n  tutorId   String\n  tutor     TutorProfile  @relation(fields: [tutorId], references: [id])\n  startTime DateTime\n  endTime   DateTime\n  status    BookingStatus @default(CONFIRMED)\n  review    Review?\n  createdAt DateTime      @default(now())\n  updatedAt DateTime      @updatedAt\n\n  @@map("bookings")\n}\n\nmodel Review {\n  id        String   @id @default(uuid())\n  bookingId String   @unique\n  booking   Booking  @relation(fields: [bookingId], references: [id])\n  rating    Int\n  comment   String?\n  createdAt DateTime @default(now())\n\n  @@map("reviews")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"Role"},{"name":"active","kind":"scalar","type":"Boolean"},{"name":"tutorProfile","kind":"object","type":"TutorProfile","relationName":"TutorProfileToUser"},{"name":"bookingsAsStudent","kind":"object","type":"Booking","relationName":"BookingToUser"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"}],"dbName":"users"},"TutorProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"TutorProfileToUser"},{"name":"userId","kind":"scalar","type":"String"},{"name":"bio","kind":"scalar","type":"String"},{"name":"subjects","kind":"object","type":"Subject","relationName":"SubjectToTutorProfile"},{"name":"bookingsAsTutor","kind":"object","type":"Booking","relationName":"BookingToTutorProfile"},{"name":"availability","kind":"scalar","type":"Json"},{"name":"pricePerHour","kind":"scalar","type":"Float"},{"name":"reviewCount","kind":"scalar","type":"Int"},{"name":"rating","kind":"scalar","type":"Float"}],"dbName":"tutor_profiles"},"Category":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"subjects","kind":"object","type":"Subject","relationName":"CategoryToSubject"}],"dbName":"categories"},"Subject":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToSubject"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"tutors","kind":"object","type":"TutorProfile","relationName":"SubjectToTutorProfile"}],"dbName":"subjects"},"Booking":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"student","kind":"object","type":"User","relationName":"BookingToUser"},{"name":"tutorId","kind":"scalar","type":"String"},{"name":"tutor","kind":"object","type":"TutorProfile","relationName":"BookingToTutorProfile"},{"name":"startTime","kind":"scalar","type":"DateTime"},{"name":"endTime","kind":"scalar","type":"DateTime"},{"name":"status","kind":"enum","type":"BookingStatus"},{"name":"review","kind":"object","type":"Review","relationName":"BookingToReview"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"bookings"},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"bookingId","kind":"scalar","type":"String"},{"name":"booking","kind":"object","type":"Booking","relationName":"BookingToReview"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"reviews"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"}},"enums":{},"types":{}}');
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer } = await import("buffer");
  const wasmArray = Buffer.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// generated/prisma/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.ts
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/lib/auth.ts
var auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  trustedOrigins: [process.env.APP_URL],
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: false
  }
});

// src/app.ts
import cors from "cors";

// src/modules/categories/category.route.ts
import express from "express";

// src/modules/categories/category.service.ts
var createCategory = async (data) => {
  const result = await prisma.category.create({
    data
  });
  return result;
};
var getAllCategories = async () => {
  const result = await prisma.category.findMany({
    include: {
      subjects: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      name: "desc"
    }
  });
  return result;
};
var categoryService = {
  createCategory,
  getAllCategories
};

// src/modules/categories/category.controller.ts
var getAllCategories2 = async (req, res) => {
  try {
    const result = await categoryService.getAllCategories();
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Internal Server Error",
      details: error
    });
  }
};
var createCategory2 = async (req, res) => {
  try {
    const result = await categoryService.createCategory(req.body);
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Internal Server Error",
      details: error
    });
  }
};

// src/middleware/verifyAuth.ts
var verifyAuth = (...roles) => {
  return async (req, res, next) => {
    const session = await auth.api.getSession({
      headers: req.headers
    });
    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      emailVerified: session.user.emailVerified
    };
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden"
      });
    }
    next();
  };
};

// src/modules/categories/category.route.ts
var router = express.Router();
router.post("/", verifyAuth("ADMIN" /* ADMIN */), createCategory2);
router.get("/", getAllCategories2);
var categoryRouter = router;

// src/modules/subjects/subjects.route.ts
import express2 from "express";

// src/modules/subjects/subject.service.ts
var createSubject = async (data) => {
  const result = await prisma.subject.create({
    data
  });
  return result;
};
var getAllSubjects = async () => {
  const result = await prisma.subject.findMany({
    select: {
      id: true,
      name: true,
      category: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      name: "desc"
    }
  });
  return result;
};
var getSubjectsByCategory = async (categoryId) => {
  return prisma.subject.findMany({
    where: { categoryId },
    select: { id: true, name: true },
    orderBy: { name: "asc" }
  });
};
var subjectService = {
  createSubject,
  getAllSubjects,
  getSubjectsByCategory
};

// src/modules/subjects/subject.controller.ts
var createSubject2 = async (req, res) => {
  try {
    const result = await subjectService.createSubject(req.body);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Internal Server Error",
      details: error
    });
  }
};
var getAllSubjects2 = async (req, res) => {
  try {
    const result = await subjectService.getAllSubjects();
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Internal Server Error",
      details: error
    });
  }
};
var getSubjectsByCategory2 = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const result = await subjectService.getSubjectsByCategory(categoryId);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Internal Server Error",
      details: error
    });
  }
};

// src/modules/subjects/subjects.route.ts
var router2 = express2.Router();
router2.post("/", verifyAuth("ADMIN" /* ADMIN */), createSubject2);
router2.get("/", getAllSubjects2);
router2.get("/:categoryId", getSubjectsByCategory2);
var subjectRouter = router2;

// src/modules/tutors/tutors.route.ts
import express3 from "express";

// src/modules/tutors/tutors.service.ts
var createTutorProfile = async (data) => {
  const { userId, bio, subjectsIds, availability, pricePerHour } = data;
  const result = await prisma.tutorProfile.create({
    data: {
      userId,
      bio: bio || null,
      pricePerHour,
      availability,
      subjects: {
        connect: subjectsIds.map((id) => ({ id }))
      }
    },
    include: {
      subjects: true
    }
  });
  return result;
};
var updateTutorProfile = async (data) => {
  const { userId, bio, subjectsIds, availability, pricePerHour } = data;
  const updateData = {};
  if (bio !== void 0) updateData.bio = bio ?? null;
  if (availability !== void 0) updateData.availability = availability ?? null;
  if (pricePerHour !== void 0) updateData.pricePerHour = pricePerHour;
  if (subjectsIds !== void 0) {
    updateData.subjects = { set: subjectsIds.map((id) => ({ id })) };
  }
  const result = await prisma.tutorProfile.update({
    where: { userId },
    data: updateData,
    include: {
      subjects: true
    }
  });
  return result;
};
var getAllTutorProfiles = async (filters) => {
  const { subjectId, categoryId, minRating, maxPrice, sortBy } = filters;
  let orderBy = void 0;
  if (sortBy === "rating_asc") {
    orderBy = { rating: "asc" };
  }
  if (sortBy === "rating_desc") {
    orderBy = { rating: "desc" };
  }
  if (sortBy === "price_asc") {
    orderBy = { pricePerHour: "asc" };
  }
  if (sortBy === "price_desc") {
    orderBy = { pricePerHour: "desc" };
  }
  const tutors = await prisma.tutorProfile.findMany({
    where: {
      ...minRating !== void 0 && {
        rating: {
          gte: minRating
        }
      },
      ...maxPrice !== void 0 && {
        pricePerHour: {
          lte: maxPrice
        }
      },
      ...subjectId && {
        subjects: {
          some: {
            id: subjectId
          }
        }
      },
      ...categoryId && {
        subjects: {
          some: {
            categoryId
          }
        }
      }
    },
    orderBy,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true
        }
      },
      subjects: {
        include: {
          category: true
        }
      }
    }
  });
  return tutors;
};
var getTutorProfileById = async (id) => {
  const tutor = await prisma.tutorProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          email: true
        }
      },
      subjects: true,
      bookingsAsTutor: {
        include: {
          review: true
          // include review for completed sessions
        }
      }
    }
  });
  if (!tutor) {
    throw new Error("Tutor not found");
  }
  return tutor;
};
var tutorProfileService = {
  createTutorProfile,
  updateTutorProfile,
  getAllTutorProfiles,
  getTutorProfileById
};

// src/modules/tutors/tutors.controller.ts
var createTutorProfile2 = async (req, res) => {
  try {
    const result = await tutorProfileService.createTutorProfile(req.body);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create tutor profile",
      details: error
    });
  }
};
var updateTutorProfile2 = async (req, res) => {
  try {
    const result = await tutorProfileService.updateTutorProfile(req.body);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update tutor profile",
      details: error
    });
  }
};
var getAllTutorProfiles2 = async (req, res) => {
  try {
    const filters = req.query;
    const result = await tutorProfileService.getAllTutorProfiles(filters);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to get tutor profiles",
      details: error
    });
  }
};
var getTutorProfileById2 = async (req, res) => {
  try {
    const tutorId = req.params.id;
    const result = await tutorProfileService.getTutorProfileById(tutorId);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to get tutor profile",
      details: error
    });
  }
};

// src/modules/tutors/tutors.route.ts
var router3 = express3.Router();
router3.post("/", verifyAuth("TUTOR" /* TUTOR */), createTutorProfile2);
router3.post("/update", verifyAuth("TUTOR" /* TUTOR */), updateTutorProfile2);
router3.get("/", getAllTutorProfiles2);
router3.get("/:id", getTutorProfileById2);
var tutorRouter = router3;

// src/modules/bookings/bookings.route.ts
import { Router } from "express";

// src/modules/bookings/bookings.service.ts
import "http";
var createBooking = async (payload) => {
  const { studentId, tutorId, startTime, endTime } = payload;
  if (startTime >= endTime) {
    throw new Error("Invalid booking time range");
  }
  const overlappingBooking = await prisma.booking.findFirst({
    where: {
      tutorId,
      status: BookingStatus.CONFIRMED,
      AND: [
        {
          startTime: {
            lt: endTime
          }
        },
        {
          endTime: {
            gt: startTime
          }
        }
      ]
    }
  });
  if (overlappingBooking) {
    throw new Error("Tutor is not available for the selected time");
  }
  const booking = await prisma.booking.create({
    data: {
      studentId,
      tutorId,
      startTime,
      endTime,
      status: BookingStatus.CONFIRMED
    }
  });
  return booking;
};
var cancelBooking = async (bookingId, studentId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId }
  });
  if (!booking) {
    throw new Error("Booking not found");
  }
  if (booking.studentId !== studentId) {
    throw new Error("You are not allowed to cancel this booking");
  }
  if (booking.status === BookingStatus.CANCELLED) {
    throw new Error("Booking is already cancelled");
  }
  const cancelledBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: BookingStatus.CANCELLED }
  });
  return cancelledBooking;
};
var completeBooking = async (bookingId, tutorId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId }
  });
  if (!booking) {
    throw new Error("Booking not found");
  }
  if (booking.tutorId !== tutorId) {
    throw new Error("You are not allowed to complete this booking");
  }
  if (booking.status !== BookingStatus.CONFIRMED) {
    throw new Error("Only confirmed bookings can be completed");
  }
  const completedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: BookingStatus.COMPLETED }
  });
  return completedBooking;
};
var getBookings = async ({ userId, role, status }) => {
  const whereClause = role === "STUDENT" ? { studentId: userId, ...status && { status } } : { tutorId: userId, ...status && { status } };
  const bookings = await prisma.booking.findMany({
    where: whereClause,
    orderBy: { startTime: "asc" },
    include: {
      student: { select: { id: true, name: true, email: true, image: true } },
      tutor: {
        select: {
          id: true,
          userId: true,
          bio: true,
          pricePerHour: true,
          rating: true,
          reviewCount: true,
          user: { select: { id: true, name: true, email: true, image: true } }
        }
      },
      review: true
    }
  });
  return bookings;
};
var getBookingById = async (bookingId, userId, role) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      student: { select: { id: true, name: true, email: true, image: true } },
      tutor: {
        select: {
          id: true,
          userId: true,
          bio: true,
          pricePerHour: true,
          rating: true,
          reviewCount: true,
          user: { select: { id: true, name: true, email: true, image: true } }
        }
      },
      review: true
    }
  });
  if (!booking) {
    throw new Error("Booking not found");
  }
  if (role === Role.STUDENT && booking.studentId !== userId) {
    throw new Error("You are not allowed to view this booking");
  }
  if (role === Role.TUTOR && booking.tutorId !== userId) {
    throw new Error("You are not allowed to view this booking");
  }
  return booking;
};
var createReview = async ({ bookingId, studentId, rating, comment }) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { tutor: true, review: true }
  });
  if (!booking) throw new Error("Booking not found");
  if (booking.studentId !== studentId) throw new Error("You are not allowed to review this booking");
  if (booking.status !== "COMPLETED") throw new Error("Booking must be completed to leave a review");
  if (booking.review) throw new Error("Review already exists for this booking");
  const tutorProfile = booking.tutor;
  const review = await prisma.review.create({
    data: {
      bookingId,
      rating,
      comment: comment || null
    }
  });
  await prisma.booking.update({
    where: { id: bookingId },
    data: { review: {
      connect: {
        id: review.id
      }
    } }
  });
  const oldCount = tutorProfile.reviewCount;
  const oldRating = tutorProfile.rating;
  const newRating = (oldRating * oldCount + rating) / (oldCount + 1);
  await prisma.tutorProfile.update({
    where: { id: tutorProfile.id },
    data: {
      rating: newRating,
      reviewCount: oldCount + 1
    }
  });
  return review;
};
var bookingsService = {
  createBooking,
  cancelBooking,
  completeBooking,
  getBookings,
  getBookingById,
  createReview
};

// src/modules/bookings/bookings.controller.ts
var createBooking2 = async (req, res, next) => {
  try {
    const booking = await bookingsService.createBooking(req.body);
    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to create booking", details: error });
  }
};
var cancelBooking2 = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const studentId = req.user?.id;
    const cancelledBooking = await bookingsService.cancelBooking(bookingId, studentId);
    res.status(200).json({ success: true, data: cancelledBooking });
  } catch (error) {
    res.status(400).json({ success: false, message: "Booking cancellation failed", details: error });
  }
};
var completeBooking2 = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const tutorId = req.user?.id;
    const completedBooking = await bookingsService.completeBooking(bookingId, tutorId);
    res.status(200).json({ success: true, data: completedBooking });
  } catch (error) {
    res.status(400).json({ success: false, message: "Booking completion failed", details: error });
  }
};
var getBookings2 = async (req, res, next) => {
  try {
    const { status } = req.query;
    const userId = req.user?.id;
    const role = req.user?.role;
    const bookings = await bookingsService.getBookings({ userId, role, status });
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to retrieve bookings", details: error });
  }
};
var getBookingById2 = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;
    const booking = await bookingsService.getBookingById(bookingId, userId, role);
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to retrieve booking", details: error });
  }
};
var createReview2 = async (req, res, next) => {
  try {
    const studentId = req.user?.id;
    const review = await bookingsService.createReview({ ...req.body, studentId });
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to create review", details: error });
  }
};
var bookingsController = {
  createBooking: createBooking2,
  cancelBooking: cancelBooking2,
  completeBooking: completeBooking2,
  getBookings: getBookings2,
  getBookingById: getBookingById2,
  createReview: createReview2
};

// src/modules/bookings/bookings.route.ts
var router4 = Router();
router4.post(
  "/",
  verifyAuth("STUDENT" /* STUDENT */),
  bookingsController.createBooking
);
router4.patch(
  "/:bookingId/cancel",
  verifyAuth("STUDENT" /* STUDENT */),
  bookingsController.cancelBooking
);
router4.patch(
  "/:bookingId/complete",
  verifyAuth("TUTOR" /* TUTOR */),
  bookingsController.completeBooking
);
router4.get(
  "/",
  verifyAuth("STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */),
  bookingsController.getBookings
);
router4.get(
  "/:bookingId",
  verifyAuth("STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */),
  bookingsController.getBookingById
);
router4.post(
  "/:bookingId/review",
  verifyAuth("STUDENT" /* STUDENT */),
  bookingsController.createReview
);
var bookingRouter = router4;

// src/modules/users/users.route.ts
import express4 from "express";

// src/modules/users/users.service.ts
import "better-auth/api";
var getStudentProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      role: true,
      active: true,
      createdAt: true,
      updatedAt: true
    }
  });
  if (!user) throw new Error("User not found");
  return user;
};
var updateStudentProfile = async (userId, data) => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      phone: data.phone,
      image: data.image
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      role: true,
      active: true,
      createdAt: true,
      updatedAt: true
    }
  });
  return updatedUser;
};
var usersService = {
  getStudentProfile,
  updateStudentProfile
};

// src/modules/users/users.controller.ts
var getStudentProfile2 = async (req, res, next) => {
  try {
    if (!req.user) throw new Error("Unauthorized");
    const userId = req.user.id;
    const profile = await usersService.getStudentProfile(userId);
    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to get profile"
    });
  }
};
var updateStudentProfile2 = async (req, res, next) => {
  try {
    if (!req.user) throw new Error("Unauthorized");
    const userId = req.user.id;
    const { name, phone, image } = req.body;
    const updatedProfile = await usersService.updateStudentProfile(userId, {
      name,
      phone,
      image
    });
    res.status(200).json({
      success: true,
      data: updatedProfile
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update profile"
    });
  }
};
var usersController = {
  getStudentProfile: getStudentProfile2,
  updateStudentProfile: updateStudentProfile2
};

// src/modules/users/users.route.ts
var router5 = express4.Router();
router5.get("/profile", verifyAuth("STUDENT" /* STUDENT */, "ADMIN" /* ADMIN */), usersController.getStudentProfile);
router5.put("/profile", verifyAuth("STUDENT" /* STUDENT */, "ADMIN" /* ADMIN */), usersController.updateStudentProfile);
var usersRouter = router5;

// src/app.ts
var app = express5();
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = !origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      callback(null, allowed ? origin || true : false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express5.json());
app.all("/api/auth/{*splat}", toNodeHandler(auth));
app.use("/categories", categoryRouter);
app.use("/subjects", subjectRouter);
app.use("/tutors", tutorRouter);
app.use("/bookings", bookingRouter);
app.use("/users", usersRouter);
app.get("/", (req, res) => {
  res.send("Hello, this is Skill Bridge server!");
});
var app_default = app;

// src/vercel.ts
var vercel_default = app_default;
export {
  vercel_default as default
};
