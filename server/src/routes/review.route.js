import express from "express";
import { getCourseReviews, upsertReview, deleteReview } from "../controllers/review.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/:courseId", getCourseReviews);
router.post("/:courseId", isAuthenticated, upsertReview);
router.delete("/:reviewId", isAuthenticated, deleteReview);

export default router;
