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
    });
    return result;
}

export const subjectService =  {
    createSubject,
    getAllSubjects
}