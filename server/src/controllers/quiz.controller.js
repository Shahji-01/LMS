import { Quiz } from "../models/quiz.model.js";
import { QuizSubmission } from "../models/quizSubmission.model.js";
import { Course } from "../models/course.model.js";
import { catchAsync } from "../middleware/error.middleware.js";
import { AppError } from "../utils/appError.js";
import { AppResponse } from "../utils/appResponse.js";
import logger from "../utils/logger.js";

/**
 * Get all quizzes for a course
 * @route GET /api/v1/quiz/course/:courseId
 */
export const getCourseQuizzes = catchAsync(async (req, res) => {
    const { courseId } = req.params;

    // Strip correct answer from public quiz listing
    const quizzes = await Quiz.find({
        course: courseId,
        isDeleted: { $ne: true },
    }).select("-questions.correctOptionIndex");

    // Fetch current user's submissions for these quizzes
    const submissions = await QuizSubmission.find({
        user: req.id,
        quiz: { $in: quizzes.map((q) => q._id) },
        isDeleted: { $ne: true },
    });

    return res.status(200).json(new AppResponse(200, "Quizzes retrieved", { quizzes, submissions }));
});

/**
 * Instructor: Create a new quiz
 * @route POST /api/v1/quiz/course/:courseId
 */
export const createQuiz = catchAsync(async (req, res) => {
    const { courseId } = req.params;
    const { title, description, questions, passingScore } = req.body;

    const course = await Course.findById(courseId);
    if (!course || course.instructor.toString() !== req.id) {
        throw new AppError(403, "Not authorized to add quizzes to this course.");
    }

    const quiz = await Quiz.create({
        course: courseId,
        title,
        description,
        questions,
        passingScore,
    });

    // Push quiz reference to course
    course.quizzes.push(quiz._id);
    await course.save();

    logger.info({ quizId: quiz._id, courseId }, "[Quiz] Quiz created");
    return res.status(201).json(new AppResponse(201, "Quiz created.", quiz));
});

/**
 * Take a quiz and grade submission
 * @route POST /api/v1/quiz/:quizId/submit
 */
export const submitQuiz = catchAsync(async (req, res) => {
    const { quizId } = req.params;
    const { answers } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) throw new AppError(404, "Quiz not found.");

    // FIX: Prevent infinite re-submission — check for existing submission
    const alreadySubmitted = await QuizSubmission.exists({
        quiz: quizId,
        user: req.id,
        isDeleted: { $ne: true },
    });
    if (alreadySubmitted) {
        throw new AppError(400, "You have already submitted this quiz. Each quiz can only be submitted once.");
    }

    if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
        throw new AppError(400, "Invalid answers payload — must match number of questions.");
    }

    // Grade the submission
    let correctCount = 0;
    quiz.questions.forEach((q, idx) => {
        if (q.correctOptionIndex === answers[idx]) correctCount++;
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;

    const submission = await QuizSubmission.create({
        quiz: quizId,
        user: req.id,
        score,
        passed,
    });

    logger.info({ quizId, userId: req.id, score, passed }, "[Quiz] Submitted");
    return res.status(200).json(new AppResponse(200, "Quiz submitted.", { score, passed, submission }));
});

/**
 * Instructor: Delete a quiz
 * @route DELETE /api/v1/quiz/:quizId
 */
export const deleteQuiz = catchAsync(async (req, res) => {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId).populate("course");
    if (!quiz || quiz.course.instructor.toString() !== req.id) {
        throw new AppError(403, "Not authorized.");
    }

    // Soft delete quiz and all its submissions
    quiz.isDeleted = true;
    quiz.deletedAt = new Date();
    await quiz.save();

    await QuizSubmission.updateMany(
        { quiz: quizId },
        { isDeleted: true, deletedAt: new Date() }
    );

    // Remove quiz reference from course
    await Course.findByIdAndUpdate(quiz.course._id, { $pull: { quizzes: quizId } });

    logger.info({ quizId }, "[Quiz] Soft-deleted");
    return res.status(200).json(new AppResponse(200, "Quiz deleted."));
});
