import type { Request, Response } from "express"
import { subjectService } from "./subject.service";

const createSubject = async (req: Request, res: Response) => {
    try {
        const result = await subjectService.createSubject(req.body);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Internal Server Error",
            details: error
        });
    }
};

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
};

const updateSubject = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const { name, categoryId } = req.body;
        const updateData: { name?: string; categoryId?: string } = {};
        if (name !== undefined && typeof name === "string") updateData.name = name.trim();
        if (categoryId !== undefined && typeof categoryId === "string") updateData.categoryId = categoryId;
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ success: false, message: "Provide name or categoryId to update" });
        }
        const result = await subjectService.updateSubject(id, updateData);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: (error as Error).message || "Failed to update subject",
        });
    }
};

const deleteSubject = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        await subjectService.deleteSubject(id);
        res.status(200).json({ success: true });
    } catch (error) {
        const msg = (error as Error).message;
        if (msg?.includes("Record to delete does not exist") || msg?.includes("not found")) {
            return res.status(404).json({ success: false, message: "Subject not found" });
        }
        res.status(400).json({
            success: false,
            message: msg || "Failed to delete subject",
        });
    }
};

export {
    getAllSubjects,
    createSubject,
    getSubjectsByCategory,
    updateSubject,
    deleteSubject,
};