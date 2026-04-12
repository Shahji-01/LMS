import express from "express";
import { isAuthenticated, restrictTo } from "../middleware/auth.middleware.js";
import {
    getInstructorAnalytics,
    getCourseAnalytics,
    getAdminAnalytics,
} from "../controllers/analytics.controller.js";

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Analytics and reporting endpoints
 */

const router = express.Router();

/**
 * @swagger
 * /analytics/instructor:
 *   get:
 *     tags: [Analytics]
 *     summary: Instructor analytics summary
 */
router.get(
    "/instructor",
    isAuthenticated,
    restrictTo("instructor", "admin"),
    getInstructorAnalytics
);

/**
 * @swagger
 * /analytics/instructor/course/{courseId}:
 *   get:
 *     tags: [Analytics]
 *     summary: Daily analytics for a specific course
 */
router.get(
    "/instructor/course/:courseId",
    isAuthenticated,
    restrictTo("instructor", "admin"),
    getCourseAnalytics
);

/**
 * @swagger
 * /analytics/admin:
 *   get:
 *     tags: [Analytics]
 *     summary: Admin platform-wide analytics
 */
router.get("/admin", isAuthenticated, restrictTo("admin"), getAdminAnalytics);

export default router;
