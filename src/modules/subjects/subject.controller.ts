import type { Request, Response } from "express"
import { subjectService } from "./subject.service";

const createSubject = async (req:Request, res: Response) => {
    try {
        const result =  await subjectService .createSubject(req.body);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Internal Server Error",
            details: error
        });
    }
}

const getAllSubjects = async (req: Request, res: Response) => {
    try {
        const result = await subjectService.getAllSubjects();
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Internal Server Error",
            details: error
        });
    }
}

const getSubjectsByCategory = async (req: Request, res: Response) => {
    try {
        const categoryId = req.params.categoryId;
        const result = await subjectService.getSubjectsByCategory(categoryId as string);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Internal Server Error",
            details: error
        });
    }
}

export {
    getAllSubjects,
    createSubject,
    getSubjectsByCategory
};