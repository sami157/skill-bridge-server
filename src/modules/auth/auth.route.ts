import { Router } from "express";
import * as authController from "./auth.controller";

const router = Router();

router.post("/register", authController.register);
router.post("/sign-up/email", authController.register);
router.post("/sign-in/email", authController.verifyCredentials);
router.post("/verify-credentials", authController.verifyCredentials);

export const authRouter = router;
