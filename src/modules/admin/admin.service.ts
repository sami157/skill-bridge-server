import { prisma } from "../../lib/prisma";

const getAllUsers = async () => {
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
            updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
    });
    return users;
};

const updateUserStatus = async (userId: string, active: boolean) => {
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
            updatedAt: true,
        },
    });
    return updatedUser;
};

export const adminService = {
    getAllUsers,
    updateUserStatus,
};
