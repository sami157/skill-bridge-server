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
};

const updateCategory = async (id: string, data: { name: string }) => {
    return prisma.category.update({
        where: { id },
        data: { name: data.name },
    });
};

const deleteCategory = async (id: string) => {
    const category = await prisma.category.findUnique({
        where: { id },
        include: { subjects: true },
    });
    if (!category) throw new Error("Category not found");
    if (category.subjects.length > 0) {
        throw new Error("Cannot delete category that has subjects. Delete or move subjects first.");
    }
    return prisma.category.delete({ where: { id } });
};

export const categoryService =  { 
    createCategory, 
    getAllCategories,
    updateCategory,
    deleteCategory,
};