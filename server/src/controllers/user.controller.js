import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import { catchAsync } from "../middleware/error.middleware.js";
import { AppError } from "../middleware/error.middleware.js";
import crypto from "crypto";
import {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendMail,
} from "../utils/mailgen.js";
import { AppResponse } from "../utils/appResponse.js";
import fs from "fs";
/**
 * Create a new user account
 * @route POST /api/v1/users/signup
 */
export const createUserAccount = catchAsync(async (req, res) => {
  // TODO: Implement create user account functionality
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError(409, "User already exists,so signin");
  }

  // Create user (password hashing is handled by the model)
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
  });

  if (!user) {
    throw new AppError(500, "Fail to signup a user");
  }
  // Update last active and generate unHashtoken for email verification
  await user.updateLastActive(); // This only modifies the document in memory.
  const unHashToken = user.getemailVerificationToken();

  await user.save({ validateBeforeSave: false }); //Nothing is written to the database until you call .save().

  await sendMail({
    email,
    subject: "Verifiction Mail",
    MailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get("host")}/verify-email/${unHashToken}`,
    ),
  });
  return res.json(
    new AppResponse(200, "User is created or Signup successfully", user),
  );
});

/**
 * Authenticate user and get token
 * @route POST /api/v1/users/signin
 */
export const authenticateUser = catchAsync(async (req, res) => {
  // TODO: Implement user authentication functionality
  const { email, password } = req.body;
  // Find user and check password
  const user = await User.findOne({ email }).select("+password"); // if password select is false then we can user .select("+password")

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError(401, "invalid email or password");
  }

  await user.updateLastActive();
  await user.save();
  await generateToken(
    res,
    user,
    "Verifiction token has been created and assigned",
  );
});

/**
 * Sign out user and clear cookie
 * @route POST /api/v1/users/signout
 */
export const signOutUser = catchAsync(async (req, res) => {
  // TODO: Implement sign out functionality
  return res
    .cookie("token", "", { maxAge: 0 }, { httpOnly: true })
    .status(200)
    .json(new AppResponse(200, "Signout successfully"));
});

/**
 * Get current user profile
 * @route GET /api/v1/users/profile
 */
export const getCurrentUserProfile = catchAsync(async (req, res) => {
  // TODO: Implement get current user profile functionality
  // this only for the user info
  // return res.json(new AppResponse(200, "User Details", req.user));

  // for all user info with course detail
  const user = User.findById(req.id)
    .populate({
      path: "enrolledCourses.course",
      select: "titile thumbnail description",
    })
    .populate({
      path: "createdCourses",
      select: "title thumbnail enrolledStudents",
    });

  if (!user) {
    throw new AppError(404, "User not found");
  }
  res.status(200).json({
    sucess: true,
    data: {
      ...user.toJson(),
      totalEnrolledCourses: user.totalEnrolledCourses, // this is coming from the virtuals
    },
  });
});

/**
 * Update user profile
 * @route PATCH /api/v1/users/profile
 */
export const updateUserProfile = catchAsync(async (req, res) => {
  // TODO: Implement update user profile functionality
  const { name, email, bio } = req.body;

  if (req.file) {
    const user = await User.findById(req.id);
    if (user.avatar && user.avatar !== "default-avatar.png") {
      await deleteMediaFromCloudinary(user.avatar);
    }
    const localAvatarPath = req.file?.path;
    const avatarUrl = await uploadMedia(localAvatarPath);
    if (!avatarUrl.url) {
      throw new AppError(500, "Failed to save to the cloudinary");
    }
  }
  const updateUser = await User.findByIdAndUpdate(
    req.id,
    {
      name,
      email: email.toLowerCase(),
      bio,
      avatar: avatar.url,
    },
    {
      new: true,
      runValidators: true,
    },
  );
  if (!updateUser) {
    throw new AppError(500, "Failed to update the user profile");
  }
  return res.json(new AppResponse(200, "user profile is updated", updateUser));
});

/**
 * Change user password
 * @route PATCH /api/v1/users/password
 */
export const changeUserPassword = catchAsync(async (req, res) => {
  // TODO: Implement change user password functionality
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.id).select("+password");
  if (!user) {
    throw new AppError("User not found or password ", 404);
  }
  // Verify current password
  const isPasswordCorrect = await user.comparePassword(currentPassword);
  if (!isPasswordCorrect) {
    throw new AppError(401, "Current password is incorrect");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res.json(new AppResponse(200, "Password is changed successfully"));
});

/**
 * Request password reset
 * @route POST /api/v1/users/forgot-password
 */
export const forgotPassword = catchAsync(async (req, res) => {
  // TODO: Implement forgot password functionality
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new AppError(400, "User does't exits");
  }
  // Generate reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const options = {
    email: user.email,
    subject: "Reset Password",
    MailgenContent: forgotPasswordMailgenContent(
      user.username,
      `${req.protocol}://${req.get("host")}/reset-password/${resetToken}`,
    ),
  };
  // Send reset token via email in options
  await sendMail(options);
  return res.json(
    new AppResponse(200, "Mail has been sent to reset the password"),
  );
});

/**
 * Reset password
 * @route POST /api/v1/users/reset-password/:token
 */
export const resetPassword = catchAsync(async (req, res) => {
  // TODO: Implement reset password functionality
  const { token } = req.params;
  const { newPassword } = req.body;

  // Get user by reset token
  if (!token) {
    throw new AppError(400, "token is missing in the params");
  }
  const hashToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  console.log(user);
  if (!user) {
    throw new AppError(401, "inValid token or token expired");
  }
  user.password = newPassword;
  user.resetPasswordToken = "";
  user.resetPasswordExpire = "";
  await user.save({ validateBeforeSave: false });
  return res.json(new AppResponse(200, "Password has been reset successfully"));
});

/**
 * Delete user account
 * @route DELETE /api/v1/users/account
 */
export const deleteUserAccount = catchAsync(async (req, res) => {
  // TODO: Implement delete user account functionality
  const user = await User.findById(req.id);

  // Delete avatar if not default
  if (user.avatar && user.avatar !== "default-avatar.png") {
    await deleteMediaFromCloudinary(user.avatar);
  }

  // Delete user
  await User.findByIdAndDelete(req.id);

  res.cookie("token", "", { maxAge: 0 });
  res.status(200).json({
    success: true,
    message: "Account deleted successfully",
  });
});
