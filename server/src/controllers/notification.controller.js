import { Notification } from "../models/notification.model.js";
import { catchAsync } from "../middleware/error.middleware.js";
import { AppResponse } from "../utils/appResponse.js";
import { AppError } from "../utils/appError.js";

/**
 * Get all notifications for the logged-in user
 * @route GET /api/v1/notification
 */
export const getMyNotifications = catchAsync(async (req, res) => {
    const userId = req.user._id;

    // Get last 50 notifications
    const notifications = await Notification.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(50);

    const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });

    return res.status(200).json(new AppResponse(200, "Notifications retrieved.", {
        notifications,
        unreadCount
    }));
});

/**
 * Mark a single notification as read
 * @route PATCH /api/v1/notification/:id/read
 */
export const markAsRead = catchAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
        { _id: id, user: userId },
        { isRead: true },
        { new: true }
    );

    if (!notification) throw new AppError(404, "Notification not found.");

    return res.status(200).json(new AppResponse(200, "Marked as read.", notification));
});

/**
 * Mark all notifications as read
 * @route PATCH /api/v1/notification/read-all
 */
export const markAllAsRead = catchAsync(async (req, res) => {
    const userId = req.user._id;

    await Notification.updateMany(
        { user: userId, isRead: false },
        { isRead: true }
    );

    return res.status(200).json(new AppResponse(200, "All notifications marked as read."));
});
