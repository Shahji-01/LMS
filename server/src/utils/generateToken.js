import jwt from "jsonwebtoken";
import config from "../config/env.js";
import { User } from "../models/user.model.js";

const ACCESS_TOKEN_EXPIRY = config.JWT_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRY = config.JWT_REFRESH_EXPIRES_IN || "7d";
const COOKIE_MAX_AGE = parseInt(config.JWT_COOKIE_EXPIRES_IN || "7") * 24 * 60 * 60 * 1000;

/**
 * Generate short-lived access token
 */
export const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, config.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

/**
 * Generate long-lived refresh token
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, config.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
};

/**
 * Issue both tokens, set HTTP-only cookies, return response
 */
export const generateToken = async (res, user, message = "Success") => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Persist refresh token in DB
  await User.findByIdAndUpdate(user._id, {
    refreshToken,
    refreshExpire: new Date(Date.now() + COOKIE_MAX_AGE),
  });

  // Set HTTP-only cookies
  res.cookie("token", accessToken, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: config.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 15 * 60 * 1000, // 15 min for access token
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: config.NODE_ENV === "production" ? "none" : "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/api/v1/user/refresh-token",
  });

  return res.status(200).json({
    success: true,
    message,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
};
