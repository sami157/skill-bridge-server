import { createSubject, getAllSubjects } from "./subject.controller";

const express = require('express')

const router = express.Router();

router.post('/', createSubject);
router.get('/', getAllSubjects);

export const subjectRouter = router;