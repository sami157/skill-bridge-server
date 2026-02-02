import express from "express";
import { adminController } from "./admin.controller";
import { verifyAuth, UserRole } from "../../middleware/verifyAuth";

const router = express.Router();

router.get("/users", verifyAuth(UserRole.ADMIN), adminController.getUsers);
router.patch("/users/:id", verifyAuth(UserRole.ADMIN), adminController.updateUserStatus);

export const adminRouter = router;
