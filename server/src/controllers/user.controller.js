import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import { Quiz } from "../models/quiz.model.js";
import bcrypt from "bcryptjs";
import { generateToken, generateAccessToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import { catchAsync } from "../middleware/error.middleware.js";
import { AppError } from "../utils/appError.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/env.js";
import { enqueueEmail } from "../queues/email.queue.js";
import { AppResponse } from "../utils/appResponse.js";
import logger from "../utils/logger.js";

/**
 * Create a new user account
 * @route POST /api/v1/user/signup
 */
export const createUserAccount = catchAsync(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError(409, "User already exists, please sign in.");
  }

  // Create user instance - hashing handled by pre-save hook
  const user = new User({
    name,
    email: email.toLowerCase(),
    password,
    role: role || "student",
  });

  // Generate verification OTP
  const otp = user.getemailVerificationToken();
  user.lastActive = Date.now();
  
  await user.save({ validateBeforeSave: false });

  // Enqueue verification email with OTP
  try {
    await enqueueEmail("verification", {
      user: { name: user.name, email: user.email },
      otp,
    });
  } catch (mailErr) {
    logger.warn({ err: mailErr.message }, "Verification email queueing failed");
  }

  return res
    .status(201)
    .json(new AppResponse(201, "Account created successfully. Please check your email for the verification code.", {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }));
});


/**
 * Authenticate user and issue JWT cookie
 * @route POST /api/v1/user/signin
 */
export const authenticateUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError(401, "Invalid email or password.");
  }

  await user.updateLastActive();
  await user.save({ validateBeforeSave: false });

  await generateToken(res, user, "Sign in successful.");
});

/**
 * Sign out user and clear cookie
 * @route POST /api/v1/user/signout
 */
export const signOutUser = catchAsync(async (req, res) => {
  return res
    .cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
    })
    .status(200)
    .json(new AppResponse(200, "Signed out successfully."));
});

/**
 * Get current user profile
 * @route GET /api/v1/user/profile
 */
export const getCurrentUserProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.id)  // FIX: added await
    .populate({
      path: "enrolledCourses",
      select: "title thumbnail description level category",
    })
    .populate({
      path: "createdCourses",
      select: "title thumbnail enrolledStudents isPublished",
    });

  if (!user) {
    throw new AppError(404, "User not found.");
  }

  return res.status(200).json({
    success: true,
    data: user,  // FIX: removed broken .toJson() call
  });
});

/**
 * Update user profile
 * @route PATCH /api/v1/user/profile
 */
export const updateUserProfile = catchAsync(async (req, res) => {
  const { name, bio } = req.body;
  const email = req.body.email ? req.body.email.toLowerCase() : undefined;

  const updateData = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (bio !== undefined) updateData.bio = bio;

  // Handle avatar upload
  if (req.file) {
    const existingUser = await User.findById(req.id);
    if (existingUser?.avatar && existingUser.avatar !== "default-avatar.png") {
      await deleteMediaFromCloudinary(existingUser.avatar).catch(() => { }); // non-fatal
    }
    const avatarResult = await uploadMedia(req.file.path);
    if (!avatarResult?.url) {
      throw new AppError(500, "Failed to upload avatar to cloud storage.");
    }
    updateData.avatar = avatarResult.url;  // FIX: proper scoping
  }

  const updatedUser = await User.findByIdAndUpdate(req.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    throw new AppError(500, "Failed to update profile.");
  }

  return res
    .status(200)
    .json(new AppResponse(200, "Profile updated successfully.", updatedUser));
});

/**
 * Change user password
 * @route PATCH /api/v1/user/change-password
 */
export const changeUserPassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.id).select("+password");
  if (!user) {
    throw new AppError(404, "User not found.");
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError(401, "Current password is incorrect.");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new AppResponse(200, "Password changed successfully."));
});

/**
 * Request password reset email
 * @route POST /api/v1/user/forgot-password
 */
export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Respond with 200 to prevent email enumeration attacks
    return res
      .status(200)
      .json(new AppResponse(200, "If an account with that email exists, a reset link has been sent."));
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  await enqueueEmail("reset", { user: { name: user.name, email: user.email }, url: resetUrl });

  return res
    .status(200)
    .json(new AppResponse(200, "Password reset link sent to your email."));
});

/**
 * Reset password using token
 * @route POST /api/v1/user/reset-password/:token
 */
export const resetPassword = catchAsync(async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!token) {
    throw new AppError(400, "Reset token is missing.");
  }

  const hashToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError(401, "Invalid or expired reset token.");
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new AppResponse(200, "Password reset successfully. You can now sign in."));
});

/**
 * Delete user account
 * @route DELETE /api/v1/user/account
 */
export const deleteUserAccount = catchAsync(async (req, res) => {
  const user = await User.findById(req.id);

  if (!user) {
    throw new AppError(404, "User not found.");
  }

  if (user.avatar && user.avatar !== "default-avatar.png") {
    await deleteMediaFromCloudinary(user.avatar).catch(() => { });
  }

  // Soft delete
  user.isDeleted = true;
  user.deletedAt = new Date();
  await user.save({ validateBeforeSave: false });

  // Cascade soft delete to created courses (if instructor)
  if (user.role === "instructor" || user.role === "admin") {
    const courses = await Course.find({ instructor: req.id });
    const courseIds = courses.map(c => c._id);
    
    await Promise.all([
      Course.updateMany({ instructor: req.id }, { isDeleted: true, deletedAt: new Date() }),
      Lecture.updateMany({ _id: { $in: courses.flatMap(c => c.lectures) } }, { isDeleted: true, deletedAt: new Date() }),
      Quiz.updateMany({ course: { $in: courseIds } }, { isDeleted: true, deletedAt: new Date() })
    ]);
  }

  return res
    .cookie("token", "", { maxAge: 0, httpOnly: true })
    .cookie("refreshToken", "", { maxAge: 0, httpOnly: true })
    .status(200)
    .json({ success: true, message: "Account deleted successfully." });
});

/**
 * Verify email address using OTP
 * @route POST /api/v1/user/verify-email
 */
export const verifyEmail = catchAsync(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new AppError(400, "Email and OTP are required.");
  }

  const hashToken = crypto.createHash("sha256").update(otp.toString()).digest("hex");
  const user = await User.findOne({
    email: email.toLowerCase(),
    emailVerificationToken: hashToken,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError(400, "Invalid or expired email verification token.");
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new AppResponse(200, "Email verified successfully. You can now sign in."));
});

/**
 * Refresh access token using refresh token cookie
 * @route POST /api/v1/user/refresh-token
 */
export const refreshToken = catchAsync(async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    throw new AppError(401, "Refresh token not found. Please sign in again.");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, config.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError(401, "Invalid or expired refresh token. Please sign in again.");
  }

  const user = await User.findById(decoded.userId).select("+refreshToken +refreshExpire");
  if (!user || user.refreshToken !== token) {
    throw new AppError(401, "Session invalid. Please sign in again.");
  }

  // Issue new access token
  const newAccessToken = generateAccessToken(user._id);
  res.cookie("token", newAccessToken, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: config.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 15 * 60 * 1000,
  });

  return res.status(200).json(new AppResponse(200, "Token refreshed successfully."));
});
