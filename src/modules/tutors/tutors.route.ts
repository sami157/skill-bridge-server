import express from "express";
import { createTutorProfile, getAllTutorProfiles, getTutorProfileById, getMyTutorProfile, getMyBookings, updateTutorProfile } from "./tutors.controller";
import { verifyAuth, UserRole } from "../../middleware/verifyAuth";

const router = express.Router();

router.post('/', verifyAuth(UserRole.TUTOR), createTutorProfile);

router.post('/update', verifyAuth(UserRole.TUTOR), updateTutorProfile);

router.get('/', getAllTutorProfiles);

router.get('/me', verifyAuth(UserRole.TUTOR), getMyTutorProfile);

router.get('/me/bookings', verifyAuth(UserRole.TUTOR), getMyBookings);

router.get('/:id', getTutorProfileById);

export const tutorRouter = router;
