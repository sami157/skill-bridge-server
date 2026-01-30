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
    const { subjectId, categoryId, minRating, maxPrice } = filters;

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



export const tutorProfileService = {
    createTutorProfile,
    updateTutorProfile,
    getAllTutorProfiles,
    getTutorProfileById
};
