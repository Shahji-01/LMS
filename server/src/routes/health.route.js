import express from "express";
import { healthCheck } from "../controllers/health.controller.js";

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: System health check
 *     description: Returns DB, Redis, and uptime status
 *     responses:
 *       200:
 *         description: Healthy
 *       503:
 *         description: Degraded
 */
const router = express.Router();
router.get("/", healthCheck);

export default router;
