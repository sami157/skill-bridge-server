import { prisma } from "../../lib/prisma";
import type { CreateTutorProfileInput, TutorSearchFilters, UpdateTutorProfileInput } from "../../lib/utils/interfaces";


const createTutorProfile = async (data: CreateTutorProfileInput) => {
    const { userId, bio, subjectsIds, availability, pricePerHour } = data;

    const result = await prisma.tutorProfile.create({
        data: {
            userId,
            bio: bio || null,
            pricePerHour,
            availability,
            subjects: {
                connect: subjectsIds.map((id) => ({ id })),
            },
        },
        include: {
            subjects: true,
        },
    });

    return result;
};

const updateTutorProfile = async (data: UpdateTutorProfileInput) => {
    const { userId, bio, subjectsIds, availability, pricePerHour } = data;

    const updateData: any = {};

    if (bio !== undefined) updateData.bio = bio ?? null;
    if (availability !== undefined) updateData.availability = availability ?? null;
    if (pricePerHour !== undefined) updateData.pricePerHour = pricePerHour;
    if (subjectsIds !== undefined) {
        updateData.subjects = { set: subjectsIds.map((id) => ({ id })) };
    }

    const result = await prisma.tutorProfile.update({
        where: { userId },
        data: updateData,
        include: {
            subjects: true,
        },
    });

    return result;
};

const getAllTutorProfiles = async (filters: TutorSearchFilters) => {
    const { subjectId, categoryId, minRating, maxPrice, sortBy } = filters;

    let orderBy: any = undefined;

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
            ...(minRating !== undefined && {
                rating: {
                    gte: minRating,
                },
            }),

            ...(maxPrice !== undefined && {
                pricePerHour: {
                    lte: maxPrice,
                },
            }),

            ...(subjectId && {
                subjects: {
                    some: {
                        id: subjectId,
                    },
                },
            }),

            ...(categoryId && {
                subjects: {
                    some: {
                        categoryId,
                    },
                },
            }),
        },

        orderBy,

        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                },
            },
            subjects: {
                include: {
                    category: true,
                },
            },
        },
    });

    return tutors;
};


const getTutorProfileByUserId = async (userId: string) => {
    const tutor = await prisma.tutorProfile.findUnique({
        where: { userId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                    email: true,
                },
            },
            subjects: true,
            bookingsAsTutor: {
                include: {
                    review: true,
                },
            },
        },
    });
    return tutor;
};

const getTutorProfileById = async (id: string) => {
    const tutor = await prisma.tutorProfile.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                    email: true,
                },
            },
            subjects: true,
            bookingsAsTutor: {
                include: {
                    review: true, // include review for completed sessions
                },
            },
        },
    });

    if (!tutor) {
        throw new Error("Tutor not found");
    }

    return tutor;
};

/** All bookings for the tutor whose TutorProfile.userId = userId (schema: Booking.tutor -> TutorProfile.userId). */
const getBookingsForTutorByUserId = async (userId: string) => {
    return prisma.booking.findMany({
        where: { tutor: { userId } },
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
};

export const tutorProfileService = {
    createTutorProfile,
    updateTutorProfile,
    getAllTutorProfiles,
    getTutorProfileById,
    getTutorProfileByUserId,
    getBookingsForTutorByUserId,
};
