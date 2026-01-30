import express from "express";
import { createSubject, getAllSubjects, getSubjectsByCategory } from "./subject.controller";
import { verifyAuth, UserRole } from "../../middleware/verifyAuth";

const router = express.Router();

router.post('/', verifyAuth(UserRole.ADMIN), createSubject);

router.get('/', getAllSubjects);

router.get('/:categoryId', getSubjectsByCategory);

export const subjectRouter = router;
