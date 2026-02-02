import type { Request, Response } from "express"
import { tutorProfileService } from "./tutors.service";
import { bookingsService } from "../bookings/bookings.service";
import type { TutorSearchFilters } from "../../lib/utils/interfaces";

const createTutorProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id!;
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
}

const updateTutorProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id!;
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
}

const getAllTutorProfiles = async (req: Request, res: Response) => {
    try {
        const filters = req.query;
        const result = await tutorProfileService.getAllTutorProfiles(filters as TutorSearchFilters);

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
}

const getTutorProfileById = async (req: Request, res: Response) => {
    try {
        const tutorId = req.params.id;
        const result = await tutorProfileService.getTutorProfileById(tutorId as string);

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

const getMyTutorProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id!;
        const result = await tutorProfileService.getTutorProfileByUserId(userId);

        res.status(200).json({
            success: true,
            data: result ?? null,
            message: result ? undefined : "Tutor profile not found"
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to get tutor profile",
            details: error
        });
    }
};

/** GET /tutors/me/bookings — fetch all bookings for the logged-in tutor (by TutorProfile.id). */
const getMyBookings = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id!;
        const bookings = await bookingsService.getBookings({
            userId,
            role: "TUTOR",
            status: undefined,
            isAdmin: false,
        });
        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to retrieve your sessions",
            details: error
        });
    }
};

export {
    createTutorProfile,
    updateTutorProfile,
    getAllTutorProfiles,
    getTutorProfileById,
    getMyTutorProfile,
    getMyBookings,
};