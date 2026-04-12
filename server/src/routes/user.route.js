import express from "express";
import {
  authenticateUser,
  changeUserPassword,
  createUserAccount,
  deleteUserAccount,
  forgotPassword,
  getCurrentUserProfile,
  resetPassword,
  signOutUser,
  updateUserProfile,
  verifyEmail,
  refreshToken,
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { upload } from "../utils/multer.js";
import {
  validateSignup,
  validateSignin,
  validatePasswordChange,
} from "../middleware/validation.middleware.js";
import { authLimiter, resetLimiter } from "../middleware/rateLimit.middleware.js";

const router = express.Router();

// Auth routes
router.post("/signup", authLimiter, validateSignup, createUserAccount);
router.post("/signin", authLimiter, validateSignin, authenticateUser);
router.post("/signout", signOutUser);
router.post("/refresh-token", refreshToken);

// Email verification
router.post("/verify-email", verifyEmail);

// Password reset
router.post("/forgot-password", resetLimiter, forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Profile routes
router.get("/profile", isAuthenticated, getCurrentUserProfile);
router.patch(
  "/profile",
  isAuthenticated,
  upload.single("avatar"),
  updateUserProfile
);

// Password management
router.patch(
  "/change-password",
  isAuthenticated,
  validatePasswordChange,
  changeUserPassword
);

// Account management
router.delete("/account", isAuthenticated, deleteUserAccount);

export default router;
