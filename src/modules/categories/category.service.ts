import type { Category } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createCategory = async (data: Omit<Category, "id">) => {
    const result = await prisma.category.create({
        data,
    });
    return result;
}

const getAllCategories = async () => {
    const result = await prisma.category.findMany({
        include: {
            subjects: {
                select: {
                    id: true,
                    name: true
                }
            }
        },
        orderBy: {
            name: 'desc'
        }
    });
    return result;
}

export const categoryService =  { 
    createCategory, 
    getAllCategories 
};