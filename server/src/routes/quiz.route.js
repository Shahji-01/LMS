import express from "express";
import { getCourseQuizzes, createQuiz, submitQuiz, deleteQuiz } from "../controllers/quiz.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/course/:courseId", isAuthenticated, getCourseQuizzes);
router.post("/course/:courseId", isAuthenticated, createQuiz); // For instructors
router.post("/:quizId/submit", isAuthenticated, submitQuiz); // For students
router.delete("/:quizId", isAuthenticated, deleteQuiz); // For instructors

export default router;
