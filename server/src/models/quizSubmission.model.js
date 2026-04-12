import mongoose from "mongoose";

const quizSubmissionSchema = new mongoose.Schema({
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
        required: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    score: {
        type: Number, // Percentage 0-100
        required: true
    },
    passed: {
        type: Boolean,
        required: true
    },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

// Prevent duplicate submission tracking logic if needed, but allowing retakes is fine
// so we'll just track the highest score or all attempts.

export const QuizSubmission = mongoose.model("QuizSubmission", quizSubmissionSchema);
