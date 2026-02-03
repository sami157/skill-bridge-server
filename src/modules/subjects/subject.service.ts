import type { Subject } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createSubject = async (data: Omit<Subject, "id">) => {
    const result = await prisma.subject.create({
        data,
    });
    return result;
}

const getAllSubjects = async () => {
    const result = await prisma.subject.findMany({
        select: {
            id: true,
            name: true,
            category: {
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

const getSubjectsByCategory = async (categoryId: string) => {
    return prisma.subject.findMany({
        where: { categoryId },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
    });
};

const updateSubject = async (id: string, data: { name?: string; categoryId?: string }) => {
    const updateData: { name?: string; categoryId?: string } = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    return prisma.subject.update({
        where: { id },
        data: updateData,
    });
};

const deleteSubject = async (id: string) => {
    return prisma.subject.delete({ where: { id } });
};

export const subjectService =  {
    createSubject,
    getAllSubjects,
    getSubjectsByCategory,
    updateSubject,
    deleteSubject,
};