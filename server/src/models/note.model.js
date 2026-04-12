import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
    {
        lecture: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lecture",
            required: true,
            index: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        content: {
            type: String,
            required: true,
            maxLength: 500,
        },
        timestamp: {
            type: Number, // Stored in seconds
            required: true,
            default: 0
        }
    },
    { timestamps: true }
);

export const Note = mongoose.model("Note", noteSchema);
