import { Review } from "../models/review.model.js";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { catchAsync } from "../middleware/error.middleware.js";
import { AppError } from "../utils/appError.js";
import { AppResponse } from "../utils/appResponse.js";

/**
 * Get all reviews for a course
 * @route GET /api/v1/review/:courseId
 */
export const getCourseReviews = catchAsync(async (req, res) => {
    const { courseId } = req.params;

    const reviews = await Review.find({ course: courseId, isDeleted: { $ne: true } })
        .populate("user", "name avatar")
        .sort({ createdAt: -1 });

    return res.status(200).json(new AppResponse(200, "Reviews retrieved successfully.", reviews));
});

/**
 * Add or Update a Review
 * @route POST /api/v1/review/:courseId
 */
export const upsertReview = catchAsync(async (req, res) => {
    const { courseId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.id;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
        throw new AppError(404, "Course not found.");
    }

    // Verify user has purchased/enrolled in the course
    const hasPurchased = await CoursePurchase.exists({
        user: userId,
        course: courseId,
        status: "completed",
    });

    if (!hasPurchased && course.instructor.toString() !== userId) {
        throw new AppError(403, "You must purchase this course before leaving a review.");
    }

    // UPSERT: Create new or update existing
    const review = await Review.findOneAndUpdate(
        { user: userId, course: courseId },
        { rating, comment, isDeleted: false, deletedAt: null },
        { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json(new AppResponse(200, "Review saved successfully.", review));
});

/**
 * Delete a Review
 * @route DELETE /api/v1/review/:reviewId
 */
export const deleteReview = catchAsync(async (req, res) => {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
        throw new AppError(404, "Review not found.");
    }

    if (review.user.toString() !== req.id) {
        throw new AppError(403, "You can only delete your own reviews.");
    }

    // Soft delete
    review.isDeleted = true;
    review.deletedAt = new Date();
    await review.save();

    return res.status(200).json(new AppResponse(200, "Review deleted successfully."));
});
