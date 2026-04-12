import { CourseProgress } from "../models/courseProgress.js";
import { Course } from "../models/course.model.js";
import { catchAsync } from "../middleware/error.middleware.js";
import { AppError } from "../utils/appError.js";
import { recordCompletion, recordWatchTime } from "../services/analytics.service.js";
import { Lecture } from "../models/lecture.model.js";
import { enqueueEmail } from "../queues/email.queue.js";
import { User } from "../models/user.model.js";
import logger from "../utils/logger.js";

/**
 * Get user's progress for a specific course
 * @route GET /api/v1/progress/:courseId
 */
export const getUserCourseProgress = catchAsync(async (req, res) => {
  const { courseId } = req.params;

  // Get course details with lectures
  const courseDetails = await Course.findById(courseId)
    .populate("lectures")
    .select("title thumbnail lectures");

  if (!courseDetails) {
    throw new AppError(404, "Course not found");
  }

  // Get user's progress for the course
  const courseProgress = await CourseProgress.findOne({
    course: courseId,
    user: req.id,
  }).populate("course");

  // If no progress found, return course details with empty progress
  if (!courseProgress) {
    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        progress: [],
        isCompleted: false,
        completionPercentage: 0,
      },
    });
  }

  // Calculate completion percentage
  const totalLectures = courseDetails.lectures.length;
  const completedLectures = courseProgress.lectureProgress.filter(
    (lp) => lp.isCompleted
  ).length;

  // Guard against division by zero
  const completionPercentage =
    totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

  res.status(200).json({
    success: true,
    data: {
      courseDetails,
      progress: courseProgress.lectureProgress,
      isCompleted: courseProgress.isCompleted,
      completionPercentage,
    },
  });
});

/**
 * Update progress for a specific lecture
 * @route PATCH /api/v1/progress/:courseId/lectures/:lectureId
 */
export const updateLectureProgress = catchAsync(async (req, res) => {
  const { courseId, lectureId } = req.params;

  // Find or create course progress
  let courseProgress = await CourseProgress.findOne({
    course: courseId,
    user: req.id,
  });

  if (!courseProgress) {
    courseProgress = await CourseProgress.create({
      user: req.id,
      course: courseId,
      isCompleted: false,
      lectureProgress: [],
    });
  }

  // FIX: Use .toString() comparison to handle ObjectId vs String mismatch
  const lectureIndex = courseProgress.lectureProgress.findIndex(
    (lp) => lp.lecture.toString() === lectureId
  );

  if (lectureIndex !== -1) {
    courseProgress.lectureProgress[lectureIndex].isCompleted = true;
    courseProgress.lectureProgress[lectureIndex].lastWatched = new Date();
  } else {
    courseProgress.lectureProgress.push({
      lecture: lectureId,
      isCompleted: true,
      lastWatched: new Date(),
    });
  }

  // Check if course is completed
  const course = await Course.findById(courseId);
  const totalLectures = course.lectures.length;
  const completedLectures = courseProgress.lectureProgress.filter(
    (lp) => lp.isCompleted
  ).length;

  // Guard against totalLectures === 0
  courseProgress.isCompleted = totalLectures > 0 && totalLectures === completedLectures;

  await courseProgress.save();

  // Record watch time (background)
  (async () => {
    try {
      const lecture = await Lecture.findById(lectureId).select("duration");
      await recordWatchTime(courseId, course.instructor.toString(), lecture?.duration || 0);
    } catch { }
  })();

  // Auto-fire analytics and completion email (non-fatal)
  if (courseProgress.isCompleted) {
    try {
      const courseDoc = await Course.findById(courseId).select("instructor title").lean();
      await recordCompletion(courseId, courseDoc?.instructor?.toString());

      const studentDoc = await User.findById(req.id).select("name email").lean();
      if (studentDoc && courseDoc) {
        await enqueueEmail("completion", { user: studentDoc, course: courseDoc });
      }
    } catch (err) {
      logger.warn({ err: err.message }, "[Progress] Analytics/email failed on completion — non-fatal");
    }
  }

  const progressPercentage =
    totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

  res.status(200).json({
    success: true,
    message: courseProgress.isCompleted
      ? "🎉 Course completed! Congratulations!"
      : "Lecture progress updated successfully",
    data: {
      lectureProgress: courseProgress.lectureProgress,
      isCompleted: courseProgress.isCompleted,
      progressPercentage,
    },
  });
});

/**
 * Mark entire course as completed
 * @route PATCH /api/v1/progress/:courseId/complete
 */
export const markCourseAsCompleted = catchAsync(async (req, res) => {
  const { courseId } = req.params;

  const courseProgress = await CourseProgress.findOne({
    course: courseId,
    user: req.id,
  });

  if (!courseProgress) {
    // FIX: correct argument order (statusCode, message)
    throw new AppError(404, "Course progress not found");
  }

  courseProgress.lectureProgress.forEach((progress) => {
    progress.isCompleted = true;
  });
  courseProgress.isCompleted = true;

  await courseProgress.save();

  try {
    const courseDoc = await Course.findById(courseId).select("instructor title").lean();
    const studentDoc = await User.findById(req.id).select("name email").lean();
    if (studentDoc && courseDoc) {
      await enqueueEmail("completion", { user: studentDoc, course: courseDoc });
    }
    // Record analytics completion
    await recordCompletion(courseId, courseDoc?.instructor?.toString()).catch(() => { });
  } catch (err) {
    logger.warn({ err: err.message }, "[Progress] Completion email/analytics failed — non-fatal");
  }

  res.status(200).json({
    success: true,
    message: "Course marked as completed",
    data: courseProgress,
  });
});

/**
 * Reset course progress
 * @route PATCH /api/v1/progress/:courseId/reset
 */
export const resetCourseProgress = catchAsync(async (req, res) => {
  const { courseId } = req.params;

  const courseProgress = await CourseProgress.findOne({
    course: courseId,
    user: req.id,
  });

  if (!courseProgress) {
    // FIX: correct argument order (statusCode, message)
    throw new AppError(404, "Course progress not found");
  }

  courseProgress.lectureProgress.forEach((progress) => {
    progress.isCompleted = false;
  });
  courseProgress.isCompleted = false;

  await courseProgress.save();

  res.status(200).json({
    success: true,
    message: "Course progress reset successfully",
    data: courseProgress,
  });
});
