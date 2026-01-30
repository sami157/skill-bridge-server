import express from "express";
import { createTutorProfile, getAllTutorProfiles, getTutorProfileById, updateTutorProfile } from "./tutors.controller";
import { verifyAuth, UserRole } from "../../middleware/verifyAuth";

const router = express.Router();

router.post('/', verifyAuth(UserRole.TUTOR), createTutorProfile);

router.post('/update', verifyAuth(UserRole.TUTOR), updateTutorProfile);

router.get('/', getAllTutorProfiles);

router.get('/:id', getTutorProfileById);

export const tutorRouter = router;
