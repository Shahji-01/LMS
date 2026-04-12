import express from "express";
import { isAuthenticated, restrictTo } from "../middleware/auth.middleware.js";
import {
    getAllUsers,
    updateUserRole,
    softDeleteUser,
    adminGetAllCourses,
    adminSoftDeleteCourse,
    getAdminStats,
} from "../controllers/admin.controller.js";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { getEmailQueue } from "../queues/email.queue.js";
import { getPaymentRetryQueue } from "../queues/payment.queue.js";
import { getVideoQueue } from "../queues/video.queue.js";

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only management endpoints
 */

const router = express.Router();

// All admin routes require auth and admin role
router.use(isAuthenticated, restrictTo("admin"));

// Bull Board — Queue Monitoring GUI
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/api/v1/admin/queues");

const queues = [
    getEmailQueue(),
    getPaymentRetryQueue(),
    getVideoQueue()
].filter(q => q !== null).map(q => new BullMQAdapter(q));

createBullBoard({
    queues,
    serverAdapter: serverAdapter,
});

router.use("/queues", serverAdapter.getRouter());

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Platform-wide statistics
 *     responses:
 *       200:
 *         description: Admin stats
 */
router.get("/stats", getAdminStats);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List all users (paginated)
 */
router.get("/users", getAllUsers);
router.patch("/users/:userId/role", updateUserRole);
router.delete("/users/:userId", softDeleteUser);

router.get("/courses", adminGetAllCourses);
router.delete("/courses/:courseId", adminSoftDeleteCourse);

export default router;
