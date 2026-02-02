import { get } from "node:http";
import { BookingStatus, Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import type { CreateBookingPayload, CreateReviewInput, GetBookingsParams } from "../../lib/utils/interfaces";

const createBooking = async (payload: CreateBookingPayload) => {
    const { studentId, tutorUserId, startTime, endTime } = payload;

    if (startTime >= endTime) {
        throw new Error("Invalid booking time range");
    }

    // Guard: payload must be tutor's User.id. If it matches a TutorProfile.id, reject with clear error.
    const byProfileId = await prisma.tutorProfile.findUnique({ where: { id: tutorUserId } });
    if (byProfileId) {
        throw new Error(
            "Use the tutor's user id (userId), not tutor profile id (tutorId). The booking API expects the tutor's User.id."
        );
    }

    // Schema: Booking.tutorId references TutorProfile.id. Resolve profile by userId and store tutorProfile.id only.
    const tutorProfile = await prisma.tutorProfile.findUnique({ where: { userId: tutorUserId } });
    if (!tutorProfile) {
        throw new Error("Tutor not found");
    }
    const tutorProfileId = tutorProfile.id;

    const overlappingBooking = await prisma.booking.findFirst({
        where: {
            tutorId: tutorProfileId,
            status: BookingStatus.CONFIRMED,
            AND: [
                {
                    startTime: {
                        lt: endTime,
                    },
                },
                {
                    endTime: {
                        gt: startTime,
                    },
                },
            ],
        },
    });

    if (overlappingBooking) {
        throw new Error("Tutor is not available for the selected time");
    }

    const booking = await prisma.booking.create({
        data: {
            studentId,
            tutorId: tutorProfileId,
            startTime,
            endTime,
            status: BookingStatus.CONFIRMED,
        },
    });

    return booking;
};

const cancelBooking = async (bookingId: string, studentId: string) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
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
        data: { status: BookingStatus.CANCELLED },
    });

    return cancelledBooking;
};

const completeBooking = async (bookingId: string, tutorUserId: string) => {
    const tutorProfile = await prisma.tutorProfile.findUnique({ where: { userId: tutorUserId } });
    if (!tutorProfile) {
        throw new Error("Tutor profile not found");
    }

    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
    });

    if (!booking) {
        throw new Error("Booking not found");
    }

    if (booking.tutorId !== tutorProfile.id) {
        throw new Error("You are not allowed to complete this booking");
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
        throw new Error("Only confirmed bookings can be completed");
    }

    const completedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.COMPLETED },
    });

    return completedBooking;
};

const getBookings = async ({ userId, role, status, isAdmin }: GetBookingsParams) => {
    type Where = { studentId?: string; tutorId?: string; status?: any };
    let whereClause: Where = {};

    if (isAdmin) {
        whereClause = { ...(status && { status }) };
    } else if (role === "STUDENT") {
        whereClause = { studentId: userId, ...(status && { status }) };
    } else if (role === "TUTOR") {
        const tutorProfile = await prisma.tutorProfile.findUnique({ where: { userId } });
        if (!tutorProfile) {
            return [];
        }
        // Schema: Booking.tutorId = TutorProfile.id. Query only by profile id (no fallback to userId).
        whereClause = {
            tutorId: tutorProfile.id,
            ...(status && { status }),
        };
    }

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
                    user: { select: { id: true, name: true, email: true, image: true } },
                },
            },
            review: true,
        },
    });

    return bookings;
};

const getBookingById = async (bookingId: string, userId: string, role: Role, isAdmin?: boolean) => {
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
                    user: { select: { id: true, name: true, email: true, image: true } },
                },
            },
            review: true,
        },
    });

    if (!booking) {
        throw new Error("Booking not found");
    }

    if (!isAdmin) {
        if (role === Role.STUDENT && booking.studentId !== userId) {
            throw new Error("You are not allowed to view this booking");
        }
        if (role === Role.TUTOR) {
            const tutorProfile = await prisma.tutorProfile.findUnique({ where: { userId } });
            if (!tutorProfile || booking.tutorId !== tutorProfile.id) {
                throw new Error("You are not allowed to view this booking");
            }
        }
    }

    return booking;
};

const createReview = async ({ bookingId, studentId, rating, comment }: CreateReviewInput) => {
    // 1️⃣ Fetch booking and tutor
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { tutor: true, review: true },
    });

    if (!booking) throw new Error("Booking not found");
    if (booking.studentId !== studentId) throw new Error("You are not allowed to review this booking");
    if (booking.status !== "COMPLETED") throw new Error("Booking must be completed to leave a review");
    if (booking.review) throw new Error("Review already exists for this booking");

    const tutorProfile = booking.tutor;

    // 2️⃣ Create review
    const review = await prisma.review.create({
        data: {
            bookingId,
            rating,
            comment: comment || null,
        },
    });

    // 3️⃣ Link review to booking
    await prisma.booking.update({
        where: { id: bookingId },
        data: { review: {
            connect: { 
                id: review.id 
            }
        } },
    });

    // 4️⃣ Update tutor rating
    const oldCount = tutorProfile.reviewCount;
    const oldRating = tutorProfile.rating;

    const newRating = ((oldRating * oldCount) + rating) / (oldCount + 1);

    await prisma.tutorProfile.update({
        where: { id: tutorProfile.id },
        data: {
            rating: newRating,
            reviewCount: oldCount + 1,
        },
    });

    return review;
};

export const bookingsService = {
    createBooking,
    cancelBooking,
    completeBooking,
    getBookings,
    getBookingById,
    createReview,
};