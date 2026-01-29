// src/modules/tutorProfile/tutorProfile.service.ts
import type { TutorProfile } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

interface CreateTutorProfileInput {
    userId: string;
    bio?: string;
    subjectsIds: string[];
    availability?: any;
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

export const tutorProfileService = {
    createTutorProfile,
};
