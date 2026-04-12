import express from "express";
import { getMyNotifications, markAsRead, markAllAsRead } from "../controllers/notification.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(isAuthenticated);

router.get("/", getMyNotifications);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);

export default router;
