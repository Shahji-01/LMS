import { catchAsync } from "../middleware/error.middleware.js";
import { AppResponse } from "../utils/appResponse.js";
import { AppError } from "../utils/appError.js";
import { getInstructorAnalyticsSummary } from "../services/analytics.service.js";
import { Analytics } from "../models/analytics.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";

/**
 * GET /api/v1/analytics/instructor
 * Instructor analytics — per-course breakdown
 */
export const getInstructorAnalytics = catchAsync(async (req, res) => {
    const instructorId = req.user._id;
    const summary = await getInstructorAnalyticsSummary(instructorId);

    // Total revenue across all courses
    const revenueResult = await CoursePurchase.aggregate([
        {
            $lookup: {
                from: "courses",
                localField: "course",
                foreignField: "_id",
                as: "courseData",
            },
        },
        { $unwind: "$courseData" },
        { $match: { "courseData.instructor": instructorId, status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;
    const totalSales = revenueResult[0]?.count || 0;

    return res.status(200).json(
        new AppResponse(200, "Instructor analytics retrieved.", {
            courses: summary,
            totalRevenue,
            totalSales,
        })
    );
});

/**
 * GET /api/v1/analytics/instructor/course/:courseId
 * Daily analytics for a specific course (last 30 days)
 */
export const getCourseAnalytics = catchAsync(async (req, res) => {
    const { courseId } = req.params;
    const instructorId = req.user._id;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const data = await Analytics.find({
        courseId,
        instructorId,
        date: { $gte: thirtyDaysAgo },
    }).sort({ date: 1 });

    return res.status(200).json(new AppResponse(200, "Course analytics retrieved.", data));
});

/**
 * GET /api/v1/analytics/admin
 * Admin platform-wide analytics aggregation
 */
export const getAdminAnalytics = catchAsync(async (req, res) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [dailyRevenue, topCourses] = await Promise.all([
        Analytics.aggregate([
            { $match: { date: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    revenue: { $sum: "$revenue" },
                    views: { $sum: "$courseViews" },
                },
            },
            { $sort: { _id: 1 } },
        ]),
        Analytics.aggregate([
            { $match: { date: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: "$courseId",
                    totalRevenue: { $sum: "$revenue" },
                    totalViews: { $sum: "$courseViews" },
                },
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "courses",
                    localField: "_id",
                    foreignField: "_id",
                    as: "course",
                },
            },
            { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },
        ]),
    ]);

    return res.status(200).json(
        new AppResponse(200, "Admin analytics retrieved.", { dailyRevenue, topCourses })
    );
});
