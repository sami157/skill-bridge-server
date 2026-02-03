import type { Request, Response } from "express"
import { categoryService } from "./category.service";
const getAllCategories = async (req: Request, res: Response) => {
    try {
        const result = await categoryService.getAllCategories();
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

const createCategory = async (req: Request, res: Response) => {
    try {
        const result =  await categoryService.createCategory(req.body);
        res.status(201).json({
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

const updateCategory = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const { name } = req.body;
        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({ success: false, message: "Name is required" });
        }
        const result = await categoryService.updateCategory(id, { name: name.trim() });
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: (error as Error).message || "Failed to update category",
        });
    }
};

const deleteCategory = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        await categoryService.deleteCategory(id);
        res.status(200).json({ success: true });
    } catch (error) {
        const msg = (error as Error).message;
        if (msg?.includes("not found")) {
            return res.status(404).json({ success: false, message: msg });
        }
        res.status(400).json({
            success: false,
            message: msg || "Failed to delete category",
        });
    }
};

export {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
};