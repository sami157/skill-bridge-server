import type { NextFunction, Request, Response } from "express"
import { categoryService } from "./category.service";
const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
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

const createCategory = async (req: Request, res: Response, next: NextFunction) => {
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
}

export {
    getAllCategories,
    createCategory
};