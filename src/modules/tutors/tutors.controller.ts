import type { Request, Response } from "express"
import { tutorProfileService } from "./tutors.service";
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
        const q = req.query;
        const searchRaw = q.search != null ? (Array.isArray(q.search) ? q.search[0] : q.search) : "";
        const searchVal = typeof searchRaw === "string" ? searchRaw.trim() : "";
        const filters: TutorSearchFilters = {
            ...(q.categoryId && { categoryId: Array.isArray(q.categoryId) ? (q.categoryId[0] as string) : (q.categoryId as string) }),
            ...(q.subjectId && { subjectId: Array.isArray(q.subjectId) ? (q.subjectId[0] as string) : (q.subjectId as string) }),
            ...(q.minRating != null && { minRating: parseFloat(Array.isArray(q.minRating) ? q.minRating[0] : q.minRating) as number }),
            ...(q.maxPrice != null && { maxPrice: parseFloat(Array.isArray(q.maxPrice) ? q.maxPrice[0] : q.maxPrice) as number }),
            ...(q.sortBy && { sortBy: (Array.isArray(q.sortBy) ? q.sortBy[0] : q.sortBy) as TutorSearchFilters["sortBy"] }),
            ...(searchVal !== "" && { search: searchVal }),
        };
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

/** GET /tutors/me/bookings — all bookings for the logged-in tutor (query by tutor.userId per schema). */
const getMyBookings = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id!;
        const bookings = await tutorProfileService.getBookingsForTutorByUserId(userId);
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