import mongoose from "mongoose";

const discussionSchema = new mongoose.Schema(
    {
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },
        lecture: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lecture",
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            required: true,
            maxLength: 1000,
        },
        parentThread: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Discussion",
            default: null, // If null, this is a top-level question. If set, this is a reply.
        },
        isInstructorReply: {
            type: Boolean,
            default: false,
        },
        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

// Virtual to fetch replies for a top-level thread
discussionSchema.virtual('replies', {
    ref: 'Discussion',
    localField: '_id',
    foreignField: 'parentThread'
});

discussionSchema.set('toJSON', { virtuals: true });
discussionSchema.set('toObject', { virtuals: true });

// Optimize lookups by lecture
discussionSchema.index({ lecture: 1, parentThread: 1 });

export const Discussion = mongoose.model("Discussion", discussionSchema);
