import jwt from "jsonwebtoken";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "./error.middleware.js";
import { User } from "../models/user.model.js";
import config from "../config/env.js";

export const isAuthenticated = catchAsync(async (req, res, next) => {
  // Extract token — support both httpOnly cookie and Authorization Bearer header
  let token = req.cookies?.token;
  if (!token) {
    const authHeader = req.header("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.replace("Bearer ", "").trim();
    }
  }

  if (!token) {
    throw new AppError(401, "You are not logged in. Please log in to get access.");
  }

  try {
    // FIX: use config.JWT_SECRET (Zod-validated) instead of raw process.env
    const decoded = jwt.verify(token, config.JWT_SECRET);

    req.id = decoded.userId;

    const user = await User.findById(req.id).select([
      "-password",
      "-emailVerificationToken",
      "-refreshToken",
      "-resetPasswordToken",
    ]);

    if (!user) {
      throw new AppError(404, "User not found.");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new AppError(401, "Invalid token. Please log in again.");
    }
    if (error.name === "TokenExpiredError") {
      throw new AppError(401, "Your token has expired. Please log in again.");
    }
    throw error;
  }
});

// Middleware for role-based access control
export const restrictTo = (...roles) => {
  return catchAsync(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError(403, "You do not have permission to perform this action.");
    }
    next();
  });
};

// Optional authentication — attaches user if token is valid, proceeds regardless
export const optionalAuth = catchAsync(async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (token) {
      // FIX: use config.JWT_SECRET here too
      const decoded = jwt.verify(token, config.JWT_SECRET);
      req.id = decoded.userId;
    }
    next();
  } catch {
    // If token is invalid, continue without authentication
    next();
  }
});

export const isInstructor = restrictTo("instructor");
export const isAdmin = restrictTo("admin");
