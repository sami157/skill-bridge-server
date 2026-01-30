import express from "express";
import { usersController } from "./users.controller";
import { UserRole, verifyAuth } from "../../middleware/verifyAuth";

const router = express.Router();

// Only authenticated students can access these routes
router.get("/profile", verifyAuth(UserRole.STUDENT), usersController.getStudentProfile);
router.put("/profile", verifyAuth(UserRole.STUDENT), usersController.updateStudentProfile);

export const usersRouter = router;
