import type { Request, Response, NextFunction } from "express";
import { usersService } from "./users.service";

const getStudentProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new Error("Unauthorized");
        const userId = req.user.id;

        const profile = await usersService.getStudentProfile(userId);

        res.status(200).json({
            success: true,
            data: profile,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: (error as Error).message || "Failed to get profile",
        });
    }
};

const updateStudentProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new Error("Unauthorized");
        const userId = req.user.id;

        const { name, phone, image } = req.body;

        const updatedProfile = await usersService.updateStudentProfile(userId, {
            name,
            phone,
            image,
        });

        res.status(200).json({
            success: true,
            data: updatedProfile,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: (error as Error).message || "Failed to update profile",
        });
    }
};

export const usersController = {
    getStudentProfile,
    updateStudentProfile,
};
