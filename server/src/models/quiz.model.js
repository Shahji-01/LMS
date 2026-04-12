import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true
    },
    options: [{
        type: String,
        required: true
    }],
    correctOptionIndex: {
        type: Number,
        required: true,
        min: 0
    }
});

const quizSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 150
    },
    description: {
        type: String,
        maxLength: 500
    },
    questions: [questionSchema],
    passingScore: {
        type: Number,
        default: 50, // Percentage
        min: 0,
        max: 100
    },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

export const Quiz = mongoose.model("Quiz", quizSchema);
