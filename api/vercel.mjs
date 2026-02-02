import {
  BookingStatus,
  Role,
  prisma
} from "./chunk-GUPK62NK.mjs";

// src/app.ts
import { toNodeHandler } from "better-auth/node";
import express6 from "express";

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
var BACKEND_BASE_URL = process.env.BETTER_AUTH_URL || (process.env.VERCEL ? "https://skill-bridge-server-eight.vercel.app/api/auth" : "http://localhost:3000/api/auth");
var isProduction = !!process.env.VERCEL || process.env.NODE_ENV === "production";
async function trustedOrigins(request) {
  const list = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "https://skill-bridge-one-pi.vercel.app"
  ];
  const headers = request?.headers;
  const get2 = headers?.get;
  if (typeof get2 === "function") {
    const raw = get2("origin") ?? get2("referer") ?? "";
    const o = (raw.split("?")[0] ?? raw).replace(/\/$/, "").trim();
    if (o && !list.includes(o)) list.push(o);
  }
  return list;
}
function maskEmail(email) {
  if (!email || typeof email !== "string") return "(no email)";
  const at = email.indexOf("@");
  if (at <= 0) return "***";
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const l = local.length >= 2 ? local.slice(0, 1) + "***" : "***";
  const d = domain.length >= 4 ? domain.slice(0, 2) + "***" + domain.slice(-2) : "***";
  return `${l}@${d}`;
}
function sanitizeForLog(obj) {
  if (obj === null || obj === void 0) return obj;
  if (typeof obj !== "object") return obj;
  const out = {};
  const skip = /* @__PURE__ */ new Set(["password", "token", "secret", "accessToken", "refreshToken", "idToken"]);
  for (const [k, v] of Object.entries(obj)) {
    if (skip.has(k)) {
      out[k] = "(redacted)";
      continue;
    }
    if (v !== null && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date)) {
      out[k] = sanitizeForLog(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}
var auth = betterAuth({
  baseURL: BACKEND_BASE_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  trustedOrigins,
  user: {
    additionalFields: {
      role: { type: "string", input: true }
    }
  },
  advanced: {
    disableOriginCheck: true,
    disableCSRFCheck: true,
    defaultCookieAttributes: isProduction ? { sameSite: "none", secure: true } : void 0,
    useSecureCookies: isProduction
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: false
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const role = user.role;
          const allowed = role === "STUDENT" || role === "TUTOR";
          if (!allowed) {
            user.role = "STUDENT";
          }
          return user;
        },
        after: async (user, _context) => {
          const emailMasked = maskEmail(user?.email);
          console.log("[Better Auth] signup: user created in DB", { id: user?.id, email: emailMasked });
          try {
            const found = user?.id ? await prisma.user.findUnique({ where: { id: user.id }, select: { id: true, email: true, name: true, role: true } }) : null;
            console.log("[Better Auth] signup: DB verification", found ? "user found" : "user NOT found", found ? { id: found.id, email: maskEmail(found.email), role: found.role } : {});
          } catch (e) {
            console.error("[Better Auth] signup: DB verification error", e);
          }
        }
      }
    }
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      const path = ctx.path ?? "";
      if (path !== "/sign-up/email" && path !== "/sign-in/email") return;
      const body = ctx.body ?? {};
      const emailMasked = maskEmail(body?.email);
      console.log("[Better Auth] request", path, "email:", emailMasked);
      const returned = ctx.returned;
      if (returned !== void 0) {
        console.log("[Better Auth] response (sanitized)", path, JSON.stringify(sanitizeForLog(returned)));
      }
    })
  }
});

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
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    let role = session.user.role;
    if (role === void 0) {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
      });
      role = dbUser?.role ?? "STUDENT";
    }
    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role,
      emailVerified: session.user.emailVerified ?? false
    };
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
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
var getTutorProfileByUserId = async (userId) => {
  const tutor = await prisma.tutorProfile.findUnique({
    where: { userId },
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
        }
      }
    }
  });
  return tutor;
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
  getTutorProfileById,
  getTutorProfileByUserId
};

// src/modules/tutors/tutors.controller.ts
var createTutorProfile2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    const result = await tutorProfileService.createTutorProfile({ ...req.body, userId });
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
    const userId = req.user?.id;
    const result = await tutorProfileService.updateTutorProfile({ ...req.body, userId });
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
var getMyTutorProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const result = await tutorProfileService.getTutorProfileByUserId(userId);
    res.status(200).json({
      success: true,
      data: result ?? null,
      message: result ? void 0 : "Tutor profile not found"
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
router3.get("/me", verifyAuth("TUTOR" /* TUTOR */), getMyTutorProfile);
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
var getBookings = async ({ userId, role, status, isAdmin }) => {
  const whereClause = isAdmin ? { ...status && { status } } : role === "STUDENT" ? { studentId: userId, ...status && { status } } : { tutorId: userId, ...status && { status } };
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
var getBookingById = async (bookingId, userId, role, isAdmin) => {
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
  if (!isAdmin) {
    if (role === Role.STUDENT && booking.studentId !== userId) {
      throw new Error("You are not allowed to view this booking");
    }
    if (role === Role.TUTOR && booking.tutorId !== userId) {
      throw new Error("You are not allowed to view this booking");
    }
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
    const studentId = req.user?.id;
    const { tutorId, startTime, endTime } = req.body;
    const booking = await bookingsService.createBooking({ studentId, tutorId, startTime, endTime });
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
    const isAdmin = role === "ADMIN";
    const bookings = await bookingsService.getBookings({ userId, role, status, isAdmin });
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
    const isAdmin = role === "ADMIN";
    const booking = await bookingsService.getBookingById(bookingId, userId, role, isAdmin);
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to retrieve booking", details: error });
  }
};
var createReview2 = async (req, res, next) => {
  try {
    const studentId = req.user?.id;
    const bookingId = req.params.bookingId;
    const { rating, comment } = req.body;
    const review = await bookingsService.createReview({ bookingId, studentId, rating, comment });
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
  verifyAuth("STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
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
router5.get("/profile", verifyAuth("STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */), usersController.getStudentProfile);
router5.put("/profile", verifyAuth("STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */), usersController.updateStudentProfile);
var usersRouter = router5;

// src/modules/admin/admin.route.ts
import express5 from "express";

// src/modules/admin/admin.service.ts
var getAllUsers = async () => {
  const users = await prisma.user.findMany({
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
    },
    orderBy: { createdAt: "desc" }
  });
  return users;
};
var updateUserStatus = async (userId, active) => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { active },
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
var adminService = {
  getAllUsers,
  updateUserStatus
};

// src/modules/admin/admin.controller.ts
var getUsers = async (req, res) => {
  try {
    const users = await adminService.getAllUsers();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to get users", details: error });
  }
};
var updateUserStatus2 = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    if (typeof active !== "boolean") {
      return res.status(400).json({ success: false, message: "active must be a boolean" });
    }
    const user = await adminService.updateUserStatus(id, active);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to update user status", details: error });
  }
};
var adminController = {
  getUsers,
  updateUserStatus: updateUserStatus2
};

// src/modules/admin/admin.route.ts
var router6 = express5.Router();
router6.get("/users", verifyAuth("ADMIN" /* ADMIN */), adminController.getUsers);
router6.patch("/users/:id", verifyAuth("ADMIN" /* ADMIN */), adminController.updateUserStatus);
var adminRouter = router6;

// src/app.ts
var app = express6();
var ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "https://skill-bridge-one-pi.vercel.app",
  "https://skill-bridge-eight.vercel.app"
];
function corsHeaders(req, res, next) {
  const origin = (req.headers.origin ?? req.headers.referer ?? "").toString().replace(/\/$/, "").split("?")[0].trim();
  const allowOrigin = origin && (ALLOWED_ORIGINS.includes(origin) || origin.endsWith(".vercel.app")) ? origin : ALLOWED_ORIGINS[0];
  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, Origin, X-Requested-With, Cookie");
  res.setHeader("Access-Control-Max-Age", "86400");
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
}
app.use(corsHeaders);
app.use(express6.json());
app.use("/api/auth", (req, _res, next) => {
  const origin = req.headers.origin ?? req.headers.referer ?? "(none)";
  console.log("[Better Auth] request Origin:", origin, "| path:", req.method, req.path);
  next();
});
app.get("/api/auth/debug-credentials", async (req, res) => {
  const { prisma: prisma2 } = await import("./prisma-3IVSLZAT.mjs");
  const email = typeof req.query.email === "string" ? req.query.email.trim().toLowerCase() : "";
  if (!email) {
    return res.status(400).json({ error: "Missing query param: email" });
  }
  try {
    const user = await prisma2.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, accounts: { select: { providerId: true } } }
    });
    const hasCredentialAccount = user?.accounts?.some((a) => a.providerId === "credential") ?? false;
    res.json({
      userFound: !!user,
      hasCredentialAccount,
      accountProviderIds: user?.accounts?.map((a) => a.providerId) ?? []
    });
  } catch (e) {
    console.error("[debug-credentials]", e);
    res.status(500).json({ error: "Database error" });
  }
});
app.use("/api/auth", toNodeHandler(auth));
app.use("/categories", categoryRouter);
app.use("/subjects", subjectRouter);
app.use("/tutors", tutorRouter);
app.use("/bookings", bookingRouter);
app.use("/users", usersRouter);
app.use("/admin", adminRouter);
app.get("/", (req, res) => {
  res.send("Hello, this is Skill Bridge server!");
});
app.get("/health", (req, res) => {
  res.json({ ok: true });
});
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});
var app_default = app;

// src/vercel.ts
var vercel_default = app_default;
export {
  vercel_default as default
};
