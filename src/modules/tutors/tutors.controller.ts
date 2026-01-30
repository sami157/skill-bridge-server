import type { Request, Response } from "express"
import { tutorProfileService } from "./tutors.service";
import type { TutorSearchFilters } from "../../lib/utils/interfaces";

const createTutorProfile = async (req: Request, res: Response) => {
    try {
        const result = await tutorProfileService.createTutorProfile(req.body);
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
        const result = await tutorProfileService.updateTutorProfile(req.body);
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
}

export {
    createTutorProfile,
    updateTutorProfile,
    getAllTutorProfiles,
    getTutorProfileById
};