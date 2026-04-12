import mongoose from "mongoose";
import { catchAsync } from "../middleware/error.middleware.js";
import { isRedisConnected, getRedisClient } from "../config/redis.js";

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check — DB, Redis, uptime
 *     responses:
 *       200:
 *         description: System health status
 */
export const healthCheck = catchAsync(async (req, res) => {
  // Check MongoDB
  let dbStatus = "disconnected";
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.command({ ping: 1 });
      dbStatus = "connected";
    }
  } catch {
    dbStatus = "error";
  }

  // Check Redis
  let redisStatus = "disconnected";
  if (isRedisConnected()) {
    try {
      await getRedisClient().ping();
      redisStatus = "connected";
    } catch {
      redisStatus = "error";
    }
  }

  const isHealthy = dbStatus === "connected";

  return res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? "ok" : "degraded",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      redis: redisStatus,
    },
    version: process.env.npm_package_version || "1.0.0",
  });
});
