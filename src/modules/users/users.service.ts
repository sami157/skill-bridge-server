import { updateUser } from "better-auth/api";
import { prisma } from "../../lib/prisma";
import type { UpdateStudentProfileInput } from "../../lib/utils/interfaces";

const getStudentProfile = async (userId: string) => {
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
            updatedAt: true,
        },
    });

    if (!user) throw new Error("User not found");

    return user;
};

const updateStudentProfile = async (userId: string, data: UpdateStudentProfileInput) => {
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            name: data.name,
            phone: data.phone,
            image: data.image,
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
            updatedAt: true,
        },
    });

    return updatedUser;
};

export const usersService = {
    getStudentProfile,
    updateStudentProfile,
};
