import { createTutorProfile, getAllTutorProfiles, getTutorProfileById, updateTutorProfile } from "./tutors.controller";


const express = require('express')

const router = express.Router();

router.post('/', createTutorProfile);
router.post('/update', updateTutorProfile);
router.get('/', getAllTutorProfiles);
router.get('/:id', getTutorProfileById);

export const tutorRouter = router;