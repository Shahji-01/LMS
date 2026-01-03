import mongoose from "mongoose";
import { getDBStatus } from "../database/db.js";
import { AppError } from "../middleware/error.middleware.js";
export const checkHealth = async (req, res) => {
  // TODO: Implement health check functionality
  try {
    const dbStatus = getDBStatus();

    const healthStatus = {
      status: "OK",
      timeStamp: new Date().toISOString(),
      services: {
        database: {
          status: dbStatus.isConnected ? "healthy" : "unhealthy",
          details: {
            ...dbStatus,
            readyState: getReadyStateText(dbStatus.readyState),
          },
        },
        server: {
          status: "healthy",
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
        },
      },
    };
    const httpStatus =
      healthStatus.services.database.status === "healthy" ? 200 : 503;
    res.status(httpStatus).json(healthStatus);
  } catch (error) {
    console.error("Health check falied", error);
    res.status(500).json({
      status: "ERROR",
      timeStamp: new Date().toISOString(),
      error: error.message,
    });
  }
};

function getReadyStateText(state) {
  // TODO: Implement get ready state text functionality
  switch (state) {
    case 0:
      return "disconnected";
    case 1:
      return "connected";
    case 2:
      return "connecting";
    case 3:
      return "disconnecting";

    default:
      return "unknown";
  }
}
