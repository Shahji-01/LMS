import express from "express";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import {
  getUserCourseProgress,
  updateLectureProgress,
  markCourseAsCompleted,
  resetCourseProgress,
} from "../controllers/courseProgress.controller.js";

const courseProgressRoute = express.Router();

// Get course progress
courseProgressRoute.get("/:courseId", isAuthenticated, getUserCourseProgress);

// Update lecture progress
courseProgressRoute.patch(
  "/:courseId/lectures/:lectureId",
  isAuthenticated,
  updateLectureProgress,
);

// Mark course as completed
courseProgressRoute.patch(
  "/:courseId/complete",
  isAuthenticated,
  markCourseAsCompleted,
);

// Reset course progress
courseProgressRoute.patch(
  "/:courseId/reset",
  isAuthenticated,
  resetCourseProgress,
);

export default courseProgressRoute;
