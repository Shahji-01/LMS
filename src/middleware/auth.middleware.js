import { AppError } from "../utils/appError.js";
import { catchAsync } from "../middleware/error.middleware.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const auth = catchAsync(async () => {
  const token =
    req.headers("Authorization").replace("Bearer", "") ||
    req.cookies.refreshToken;

  if (!token) {
    throw new AppError(401, "Token is missing or not found");
  }
  try {
    const decodeToken = await jwt.verify(token, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const user = await User.findById(decodeToken.id);
    if (!decodeToken && !user) {
      throw new AppError(401, "token is invalid or expired");
    }
    req.id = decodeToken.id;
    req.user = user;
    next();
  } catch (error) {
    throw new AppError(401, "token is invalid or expired", error);
    process.exit(1);
  }
});
export { asyncHandler };
