import express from "express";
import { createSubject, getAllSubjects, getSubjectsByCategory, updateSubject, deleteSubject } from "./subject.controller";
import { verifyAuth, UserRole } from "../../middleware/verifyAuth";

const router = express.Router();

router.get('/', getAllSubjects);
router.post('/', verifyAuth(UserRole.ADMIN), createSubject);
router.put('/:id', verifyAuth(UserRole.ADMIN), updateSubject);
router.delete('/:id', verifyAuth(UserRole.ADMIN), deleteSubject);
router.get('/by-category/:categoryId', getSubjectsByCategory);

export const subjectRouter = router;
