import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import { Quiz } from "../models/quiz.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { User } from "../models/user.model.js";
import { catchAsync } from "../middleware/error.middleware.js";
import { AppError } from "../utils/appError.js";
import { AppResponse } from "../utils/appResponse.js";
import { paginateCursor } from "../utils/paginate.js";
import logger from "../utils/logger.js";

/**
 * GET /api/v1/admin/users
 * List all users (paginated, filterable by role)
 */
export const getAllUsers = catchAsync(async (req, res) => {
    const { role, cursor, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;

    const result = await paginateCursor(User, filter, {
        cursor,
        limit: parseInt(limit),
        sort: { createdAt: -1 },
        populate: null,
    });

    return res.status(200).json(new AppResponse(200, "Users retrieved.", result));
});

/**
 * PATCH /api/v1/admin/users/:userId/role
 * Update a user's role
 */
export const updateUserRole = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["student", "instructor", "admin"].includes(role)) {
        throw new AppError(400, "Invalid role. Must be student, instructor, or admin.");
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true, runValidators: true });
    if (!user) throw new AppError(404, "User not found.");

    logger.info({ userId, newRole: role }, "[Admin] User role updated");
    return res.status(200).json(new AppResponse(200, `User role updated to '${role}'.`, user));
});

/**
 * DELETE /api/v1/admin/users/:userId
 * Soft-delete a user and cascade to their courses/lectures/quizzes
 */
export const softDeleteUser = catchAsync(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) throw new AppError(404, "User not found.");

    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save({ validateBeforeSave: false });

    // Cascade soft delete to courses/lectures/quizzes if instructor or admin
    if (user.role === "instructor" || user.role === "admin") {
        const courses = await Course.find({ instructor: userId });
        const courseIds = courses.map((c) => c._id);

        await Promise.all([
            Course.updateMany(
                { instructor: userId },
                { isDeleted: true, deletedAt: new Date() }
            ),
            Lecture.updateMany(
                { _id: { $in: courses.flatMap((c) => c.lectures) } },
                { isDeleted: true, deletedAt: new Date() }
            ),
            Quiz.updateMany(
                { course: { $in: courseIds } },
                { isDeleted: true, deletedAt: new Date() }
            ),
        ]);

        logger.info({ userId, courseCount: courseIds.length }, "[Admin] Cascaded soft-delete to courses");
    }

    logger.info({ userId }, "[Admin] User soft-deleted");
    return res.status(200).json(new AppResponse(200, "User deactivated successfully."));
});

/**
 * GET /api/v1/admin/courses
 * List all courses including unpublished (admin view)
 */
export const adminGetAllCourses = catchAsync(async (req, res) => {
    const { cursor, limit = 20, published } = req.query;
    const filter = {};
    if (published !== undefined) filter.isPublished = published === "true";

    const result = await paginateCursor(Course, filter, {
        cursor,
        limit: parseInt(limit),
        sort: { createdAt: -1 },
        populate: { path: "instructor", select: "name email avatar" },
    });

    return res.status(200).json(new AppResponse(200, "Courses retrieved.", result));
});

/**
 * DELETE /api/v1/admin/courses/:courseId
 * Soft-delete a course and cascade to lectures + quizzes
 */
export const adminSoftDeleteCourse = catchAsync(async (req, res) => {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) throw new AppError(404, "Course not found.");

    course.isDeleted = true;
    course.deletedAt = new Date();
    await course.save({ validateBeforeSave: false });

    // Cascade soft delete to lectures and quizzes
    await Promise.all([
        Lecture.updateMany(
            { _id: { $in: course.lectures } },
            { isDeleted: true, deletedAt: new Date() }
        ),
        Quiz.updateMany(
            { course: courseId },
            { isDeleted: true, deletedAt: new Date() }
        ),
    ]);

    logger.info({ courseId }, "[Admin] Course soft-deleted with cascades");
    return res.status(200).json(new AppResponse(200, "Course removed successfully."));
});

/**
 * GET /api/v1/admin/stats
 * Platform-wide stats for admin dashboard
 */
export const getAdminStats = catchAsync(async (req, res) => {
    const [totalUsers, totalCourses, totalRevenue, recentPurchases] = await Promise.all([
        User.countDocuments({ isDeleted: { $ne: true } }),
        Course.countDocuments({ isDeleted: { $ne: true } }),
        CoursePurchase.aggregate([
            { $match: { status: "completed" } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        CoursePurchase.find({ status: "completed" })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("user", "name email avatar")
            .populate("course", "title thumbnail"),
    ]);

    return res.status(200).json(
        new AppResponse(200, "Admin stats retrieved.", {
            totalUsers,
            totalCourses,
            totalRevenue: totalRevenue[0]?.total || 0,
            recentPurchases,
        })
    );
});
