import { Note } from "../models/note.model.js";
import { catchAsync } from "../middleware/error.middleware.js";
import { AppError } from "../utils/appError.js";
import { AppResponse } from "../utils/appResponse.js";

/**
 * Get all notes for the current user for a specific lecture
 * @route GET /api/v1/note/:lectureId
 */
export const getMyNotes = catchAsync(async (req, res) => {
    const { lectureId } = req.params;
    const userId = req.id;

    const notes = await Note.find({ lecture: lectureId, user: userId })
        .sort({ timestamp: 1 }); // Chronological order by video timestamp

    return res.status(200).json(new AppResponse(200, "Notes retrieved", notes));
});

/**
 * Create a new timestamped note
 * @route POST /api/v1/note/:lectureId
 */
export const createNote = catchAsync(async (req, res) => {
    const { lectureId } = req.params;
    const { content, timestamp } = req.body;
    const userId = req.id;

    if (!content) {
        throw new AppError(400, "Note content cannot be empty.");
    }

    const note = await Note.create({
        lecture: lectureId,
        user: userId,
        content,
        timestamp: timestamp || 0
    });

    return res.status(201).json(new AppResponse(201, "Note saved.", note));
});

/**
 * Delete a note
 * @route DELETE /api/v1/note/:noteId
 */
export const deleteNote = catchAsync(async (req, res) => {
    const { noteId } = req.params;
    const userId = req.id;

    const note = await Note.findOneAndDelete({ _id: noteId, user: userId });
    if (!note) {
        throw new AppError(404, "Note not found or unauthorized.");
    }

    return res.status(200).json(new AppResponse(200, "Note deleted successfully."));
});
