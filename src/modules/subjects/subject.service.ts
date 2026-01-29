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

export const subjectService =  {
    createSubject,
    getAllSubjects,
    getSubjectsByCategory
}