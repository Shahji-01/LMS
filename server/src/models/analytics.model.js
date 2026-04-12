import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
    {
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
            index: true,
        },
        instructorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        date: {
            type: Date,
            required: true,
            default: () => {
                const d = new Date();
                d.setHours(0, 0, 0, 0);
                return d;
            },
        },
        courseViews: { type: Number, default: 0 },
        watchTime: { type: Number, default: 0 }, // seconds
        completions: { type: Number, default: 0 },
        revenue: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Compound index for efficient querying
analyticsSchema.index({ courseId: 1, instructorId: 1, date: 1 }, { unique: true });

export const Analytics = mongoose.model("Analytics", analyticsSchema);
