import express from "express";
import { getMyNotes, createNote, deleteNote } from "../controllers/note.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/:lectureId", isAuthenticated, getMyNotes);
router.post("/:lectureId", isAuthenticated, createNote);
router.delete("/:noteId", isAuthenticated, deleteNote);

export default router;
