import express from "express";
import { usersController } from "./users.controller";
import { UserRole, verifyAuth } from "../../middleware/verifyAuth";

const router = express.Router();

// Any authenticated user (student, tutor, admin) can access their own profile
router.get("/profile", verifyAuth(UserRole.STUDENT, UserRole.TUTOR, UserRole.ADMIN), usersController.getStudentProfile);
router.put("/profile", verifyAuth(UserRole.STUDENT, UserRole.TUTOR, UserRole.ADMIN), usersController.updateStudentProfile);

export const usersRouter = router;
