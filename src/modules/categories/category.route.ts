const express = require('express')
const { getAllCategories, createCategory } = require('./category.controller')

const router = express.Router();

router.post('/', createCategory);
router.get('/', getAllCategories);

export const categoryRouter = router;