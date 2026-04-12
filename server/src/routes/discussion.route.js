import express from "express";
import { getDiscussions, createDiscussion, deleteDiscussion } from "../controllers/discussion.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/:lectureId", isAuthenticated, getDiscussions);
router.post("/:courseId/:lectureId", isAuthenticated, createDiscussion);
router.delete("/:discussionId", isAuthenticated, deleteDiscussion);

export default router;
