import express from "express";
import { getAllCategories, createCategory, updateCategory, deleteCategory } from "./category.controller";
import { verifyAuth, UserRole } from "../../middleware/verifyAuth";

const router = express.Router();

router.get('/', getAllCategories);
router.post('/', verifyAuth(UserRole.ADMIN), createCategory);
router.put('/:id', verifyAuth(UserRole.ADMIN), updateCategory);
router.delete('/:id', verifyAuth(UserRole.ADMIN), deleteCategory);

export const categoryRouter = router;
