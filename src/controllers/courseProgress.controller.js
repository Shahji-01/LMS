import { CourseProgress } from "../models/courseProgress.js";
import { Course } from "../models/course.model.js";
import { catchAsync } from "../middleware/error.middleware.js";
import { AppError } from "../middleware/error.middleware.js";
import { AppResponse } from "../utils/appResponse.js";
import { isValidObjectId } from "mongoose";

/**
 * Get user's progress for a specific course
 * @route GET /api/v1/progress/:courseId
 */
export const getUserCourseProgress = catchAsync(async (req, res) => {
  // TODO: Implement get user's course progress functionality
  const { courseId } = req.params;
  if (!courseId) {
    throw new AppError(400, "courseId is missing");
  }
  const courseProgress = await CourseProgress.findOne({ course: courseId });
  if (!courseProgress) {
    throw new AppError(
      400,
      "there is no such courseProgress exits or the user has not started yet"
    );
  }
  return req.json(
    new AppResponse(200, "User course progress:", courseProgress)
  );
});

/**
 * Update progress for a specific lecture
 * @route PATCH /api/v1/progress/:courseId/lectures/:lectureId
 */
export const updateLectureProgress = catchAsync(async (req, res) => {
  // TODO: Implement update lecture progress functionality
  const { courseId, lectureId } = req.params;
  If(!isValidObjectId(courseId) && !isValidObjectId(lectureId)){
    throw new AppError(400,"courseId or lectureId is missing or not found")
  }
  const courseProgress=await CourseProgress.findOne({course:courseId,lecture})
});

/**
 * Mark entire course as completed
 * @route PATCH /api/v1/progress/:courseId/complete
 */
export const markCourseAsCompleted = catchAsync(async (req, res) => {
  // TODO: Implement mark course as completed functionality
});

/**
 * Reset course progress
 * @route PATCH /api/v1/progress/:courseId/reset
 */
export const resetCourseProgress = catchAsync(async (req, res) => {
  // TODO: Implement reset course progress functionality
});
