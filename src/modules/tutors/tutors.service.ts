// src/modules/tutorProfile/tutorProfile.service.ts
import type { TutorProfile } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

interface CreateTutorProfileInput {
    userId: string;
    bio?: string;
    subjectsIds: string[];
    availability?: any;
}

interface UpdateTutorProfileInput {
    userId: string;
    bio?: string | null;
    subjectsIds?: string[];
    availability?: any | null;
}

const createTutorProfile = async (data: CreateTutorProfileInput) => {
    const { userId, bio, subjectsIds, availability } = data;

    const result = await prisma.tutorProfile.create({
        data: {
            userId,
            bio: bio || null,
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
    const { userId, bio, subjectsIds, availability } = data;

    const updateData: any = {};

    if (bio !== undefined) updateData.bio = bio ?? null;
    if (availability !== undefined) updateData.availability = availability ?? null;
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


export const tutorProfileService = {
    createTutorProfile,
    updateTutorProfile
};
