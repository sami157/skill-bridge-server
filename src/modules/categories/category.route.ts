import express from "express";
import { getAllCategories, createCategory } from "./category.controller";
import { verifyAuth, UserRole } from "../../middleware/verifyAuth";

const router = express.Router();

router.post('/', verifyAuth(UserRole.ADMIN), createCategory);

router.get('/', getAllCategories);

export const categoryRouter = router;
