import { Wishlist } from "../models/wishlist.model.js";
import { Course } from "../models/course.model.js";
import { catchAsync } from "../middleware/error.middleware.js";
import { AppError } from "../utils/appError.js";
import { AppResponse } from "../utils/appResponse.js";

/**
 * Get user's wishlist
 * @route GET /api/v1/wishlist/
 */
export const getMyWishlist = catchAsync(async (req, res) => {
    const wishlist = await Wishlist.find({ user: req.id })
        .populate({
            path: "course",
            match: { isDeleted: { $ne: true } },
            select: "title thumbnail price instructor level category rating enrolledStudents",
            populate: { path: "instructor", select: "name avatar" }
        })
        .sort({ createdAt: -1 });

    // Filter out wishlist items where the course has been deleted
    const activeWishlist = wishlist.filter(item => item.course);

    return res.status(200).json(new AppResponse(200, "Wishlist retrieved", activeWishlist));
});

/**
 * Toggle Wishlist (Add/Remove)
 * @route POST /api/v1/wishlist/:courseId
 */
export const toggleWishlist = catchAsync(async (req, res) => {
    const { courseId } = req.params;
    const userId = req.id;

    const course = await Course.findById(courseId);
    if (!course || course.isDeleted) {
        throw new AppError(404, "Course not found.");
    }

    const existingWishlist = await Wishlist.findOne({ user: userId, course: courseId });

    if (existingWishlist) {
        // Remove from wishlist
        await existingWishlist.deleteOne();
        return res.status(200).json(new AppResponse(200, "Course removed from wishlist.", { isWishlisted: false }));
    } else {
        // Add to wishlist
        const wishlist = await Wishlist.create({ user: userId, course: courseId });
        return res.status(201).json(new AppResponse(201, "Course added to wishlist.", { isWishlisted: true }));
    }
});

/**
 * Check if a course is wishlisted by the current user
 * @route GET /api/v1/wishlist/check/:courseId
 */
export const checkWishlistStatus = catchAsync(async (req, res) => {
    const { courseId } = req.params;
    const userId = req.id;

    const isWishlisted = await Wishlist.exists({ user: userId, course: courseId });

    return res.status(200).json(new AppResponse(200, "Wishlist status retrieved", { isWishlisted: !!isWishlisted }));
});
