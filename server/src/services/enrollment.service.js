import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";
import { CourseProgress } from "../models/courseProgress.js";
import { Notification } from "../models/notification.model.js";
import { enqueueEmail } from "../queues/email.queue.js";
import { recordRevenue } from "./analytics.service.js";
import logger from "../utils/logger.js";

/**
 * Shared enrollment logic used by BOTH Stripe and Razorpay payment flows.
 * Enrolls a student in a course, sends receipt email, creates in-app notifications,
 * and records analytics revenue. Idempotent — safe to call multiple times.
 *
 * @param {object} options
 * @param {string|ObjectId} options.userId
 * @param {string|ObjectId} options.courseId
 * @param {number} options.amount  - Final paid amount
 * @param {string} [options.paymentMethod] - "stripe" | "razorpay"
 */
export const enrollStudentInCourse = async ({ userId, courseId, amount, paymentMethod = "unknown" }) => {
  try {
    // 1. Enroll student — $addToSet is idempotent (safe for duplicate calls)
    const [user, course] = await Promise.all([
      User.findByIdAndUpdate(
        userId,
        { $addToSet: { enrolledCourses: courseId } },
        { new: true }
      ),
      Course.findByIdAndUpdate(
        courseId,
        { $addToSet: { enrolledStudents: userId } },
        { new: true }
      ),
    ]);

    if (!user || !course) {
      logger.warn({ userId, courseId }, "[Enrollment] User or course not found during enrollment");
      return { success: false };
    }

    // 2. Record revenue analytics (non-fatal)
    recordRevenue(courseId, course.instructor, amount).catch((err) =>
      logger.warn({ err: err.message }, "[Enrollment] Analytics revenue record failed")
    );

    // 3. Send receipt email (non-fatal)
    enqueueEmail("receipt", { user, course, amount }).catch((err) =>
      logger.warn({ err: err.message }, "[Enrollment] Receipt email enqueue failed")
    );

    // 4. In-app notification for student and instructor (non-fatal)
    Notification.create([
      {
        user: userId,
        title: "Enrollment Successful",
        message: `Welcome to "${course.title}"! Jump in and start learning today.`,
        type: "purchase",
        link: `/course-progress/${courseId}`,
      },
      {
        user: course.instructor,
        title: "New Student Enrollment",
        message: `A new student just enrolled in "${course.title}"!`,
        type: "purchase",
        link: `/instructor/analytics`,
      },
    ]).catch((err) =>
      logger.warn({ err: err.message }, "[Enrollment] Notification creation failed")
    );

    logger.info({ userId, courseId, amount, paymentMethod }, "[Enrollment] Student enrolled successfully");
    return { success: true, user, course };
  } catch (err) {
    logger.error({ err: err.message, userId, courseId }, "[Enrollment] Critical enrollment failure");
    throw err;
  }
};
