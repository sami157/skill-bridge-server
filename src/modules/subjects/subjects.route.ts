import { createSubject, getAllSubjects, getSubjectsByCategory } from "./subject.controller";

const express = require('express')

const router = express.Router();

router.post('/', createSubject);
router.get('/', getAllSubjects);
router.get('/:categoryId', getSubjectsByCategory);

export const subjectRouter = router;