import express from "express";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../controllers/category.controller.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getCategories); // Public

// Admin Only
router.post("/", isAuthenticated, isAdmin, createCategory);
router.put("/:id", isAuthenticated, isAdmin, updateCategory);
router.delete("/:id", isAuthenticated, isAdmin, deleteCategory);

export default router;
