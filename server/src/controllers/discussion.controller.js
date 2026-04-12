import { Discussion } from "../models/discussion.model.js";
import { Course } from "../models/course.model.js";
import { catchAsync } from "../middleware/error.middleware.js";
import { AppError } from "../utils/appError.js";
import { AppResponse } from "../utils/appResponse.js";

/**
 * Get all top-level discussions for a lecture, including their replies
 * @route GET /api/v1/discussion/:lectureId
 */
export const getDiscussions = catchAsync(async (req, res) => {
    const { lectureId } = req.params;

    const discussions = await Discussion.find({ lecture: lectureId, parentThread: null, isDeleted: { $ne: true } })
        .populate("user", "name avatar role")
        .populate({
            path: "replies",
            match: { isDeleted: { $ne: true } },
            populate: { path: "user", select: "name avatar role" },
            options: { sort: { createdAt: 1 } }
        })
        .sort({ createdAt: -1 });

    return res.status(200).json(new AppResponse(200, "Discussions retrieved", discussions));
});

/**
 * Create a new discussion thread or reply
 * @route POST /api/v1/discussion/:courseId/:lectureId
 */
export const createDiscussion = catchAsync(async (req, res) => {
    const { courseId, lectureId } = req.params;
    const { content, parentThread } = req.body;
    const userId = req.id;

    if (!content) {
        throw new AppError(400, "Content cannot be empty.");
    }

    const course = await Course.findById(courseId);
    if (!course) {
        throw new AppError(404, "Course not found.");
    }

    const isInstructor = course.instructor.toString() === userId;

    const discussion = await Discussion.create({
        course: courseId,
        lecture: lectureId,
        user: userId,
        content,
        parentThread: parentThread || null,
        isInstructorReply: isInstructor
    });

    // Populate user details for immediate frontend rendering
    await discussion.populate("user", "name avatar role");

    return res.status(201).json(new AppResponse(201, "Posted successfully.", discussion));
});

/**
 * Delete a discussion (and its replies if it's a top-level thread)
 * @route DELETE /api/v1/discussion/:discussionId
 */
export const deleteDiscussion = catchAsync(async (req, res) => {
    const { discussionId } = req.params;
    const userId = req.id;

    const discussion = await Discussion.findById(discussionId).populate("course");
    if (!discussion) {
        throw new AppError(404, "Discussion not found.");
    }

    const isInstructor = discussion.course && discussion.course.instructor?.toString() === userId;
    
    if (discussion.user.toString() !== userId && !isInstructor) {
        throw new AppError(403, "Not authorized to delete this post.");
    }

    // If it's a top-level thread, soft delete all its replies too
    if (!discussion.parentThread) {
        await Discussion.updateMany({ parentThread: discussionId }, { isDeleted: true, deletedAt: new Date() });
    }
    
    discussion.isDeleted = true;
    discussion.deletedAt = new Date();
    await discussion.save();

    return res.status(200).json(new AppResponse(200, "Deleted successfully."));
});
