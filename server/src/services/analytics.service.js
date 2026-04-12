import { Analytics } from "../models/analytics.model.js";
import logger from "../utils/logger.js";

/**
 * Record or increment a course view event
 */
export const recordCourseView = async (courseId, instructorId) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await Analytics.findOneAndUpdate(
            { courseId, instructorId, date: today },
            { $inc: { courseViews: 1 } },
            { upsert: true, new: true }
        );
    } catch (err) {
        logger.warn({ err: err.message, courseId }, "[Analytics] recordCourseView error");
    }
};

/**
 * Record watch time for a lecture completion
 */
export const recordWatchTime = async (courseId, instructorId, durationSeconds) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await Analytics.findOneAndUpdate(
            { courseId, instructorId, date: today },
            { $inc: { watchTime: durationSeconds } },
            { upsert: true, new: true }
        );
    } catch (err) {
        logger.warn({ err: err.message, courseId }, "[Analytics] recordWatchTime error");
    }
};

/**
 * Record a course completion
 */
export const recordCompletion = async (courseId, instructorId) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await Analytics.findOneAndUpdate(
            { courseId, instructorId, date: today },
            { $inc: { completions: 1 } },
            { upsert: true, new: true }
        );
    } catch (err) {
        logger.warn({ err: err.message, courseId }, "[Analytics] recordCompletion error");
    }
};

/**
 * Record revenue from a purchase
 */
export const recordRevenue = async (courseId, instructorId, amount) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await Analytics.findOneAndUpdate(
            { courseId, instructorId, date: today },
            { $inc: { revenue: amount } },
            { upsert: true, new: true }
        );
    } catch (err) {
        logger.warn({ err: err.message, courseId }, "[Analytics] recordRevenue error");
    }
};

/**
 * Get analytics summary for an instructor across all their courses
 */
export const getInstructorAnalyticsSummary = async (instructorId) => {
    const pipeline = [
        { $match: { instructorId } },
        {
            $group: {
                _id: "$courseId",
                totalViews: { $sum: "$courseViews" },
                totalWatchTime: { $sum: "$watchTime" },
                totalRevenue: { $sum: "$revenue" },
                totalCompletions: { $sum: "$completions" },
            },
        },
        {
            $lookup: {
                from: "courses",
                localField: "_id",
                foreignField: "_id",
                as: "course",
            },
        },
        { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                courseId: "$_id",
                courseTitle: "$course.title",
                totalViews: 1,
                totalWatchTime: 1,
                totalRevenue: 1,
                totalCompletions: 1,
            },
        },
    ];

    return Analytics.aggregate(pipeline);
};
