import React, { useState, useEffect } from "react";
import { getMyNotes, createNote, deleteNote } from "../api/services/noteService";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { FileEdit, Trash2, Play } from "lucide-react";

// Format seconds into MM:SS
const formatTime = (secs) => {
    const min = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${min}:${s < 10 ? '0' : ''}${s}`;
};

const NoteSection = ({ lectureId, getCurrentTime, onSeek }) => {
    const { isAuthenticated } = useAuth();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!lectureId || !isAuthenticated) {
            setLoading(false);
            return;
        }
        fetchNotes();
    }, [lectureId, isAuthenticated]);

    const fetchNotes = async () => {
        try {
            setLoading(true);
            const res = await getMyNotes(lectureId);
            setNotes(res.data || []);
        } catch {
            // fail silently
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNote = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setSubmitting(true);
        try {
            const currentTimestamp = getCurrentTime ? getCurrentTime() : 0;
            await createNote(lectureId, { content, timestamp: currentTimestamp });
            toast.success("Note saved!");
            setContent("");
            fetchNotes();
        } catch (err) {
            toast.error(err.response?.data?.error?.message || "Failed to save note.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (noteId) => {
        if (!window.confirm("Delete this note?")) return;
        try {
            await deleteNote(noteId);
            toast.success("Note deleted.");
            fetchNotes();
        } catch {
            toast.error("Failed to delete note.");
        }
    };

    if (!isAuthenticated) return (
        <div className="bg-slate-900 border border-white/5 rounded-[2rem] p-10 text-center shadow-xl">
            <p className="text-slate-400">You must be signed in to take notes.</p>
        </div>
    );

    if (loading) return <div className="animate-pulse h-32 bg-slate-800 rounded-2xl w-full" />;

    return (
        <div className="bg-slate-900 border border-white/5 rounded-[2rem] p-6 lg:p-10 text-slate-300 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
                <FileEdit className="w-8 h-8 text-yellow-500" />
                <h2 className="text-2xl font-heading font-bold text-white tracking-tight">My Private Notes</h2>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSaveNote} className="mb-10 bg-slate-800/50 p-4 rounded-xl border border-white/5">
                <div className="mb-3 flex items-center gap-2">
                    <span className="text-xs font-bold bg-slate-950 text-slate-400 px-3 py-1.5 rounded-lg border border-slate-700/50 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        Notes are automatically synced to the current video playback time.
                    </span>
                </div>
                <textarea
                    className="w-full bg-slate-950 text-slate-300 placeholder-slate-500 border border-slate-700/50 rounded-lg p-4 focus:outline-none focus:border-yellow-500 min-h-[100px] resize-y transition-colors"
                    placeholder="Take notes here at the current timestamp..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    maxLength={500}
                />
                <div className="mt-4 flex justify-end">
                    <button type="submit" disabled={submitting || !content.trim()} className="bg-yellow-600 hover:bg-yellow-500 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 border border-yellow-500/50 shadow-lg shadow-yellow-600/20">
                        {submitting ? "Saving..." : "Save Note"}
                    </button>
                </div>
            </form>

            {/* List */}
            <div className="space-y-4">
                {notes.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center italic py-8 border-t border-white/5">
                        You have no notes for this lecture. Start typing above to take notes!
                    </p>
                ) : (
                    notes.map((note) => (
                        <div key={note._id} className="p-5 bg-slate-800/20 border border-white/5 rounded-2xl group transition-colors hover:bg-slate-800/40">
                            <div className="flex items-start justify-between gap-4">
                                <button 
                                    onClick={() => onSeek && onSeek(note.timestamp)}
                                    className="flex items-center gap-1.5 shrink-0 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white px-3 py-1 rounded-md text-xs font-bold font-mono transition-colors border border-blue-500/20"
                                    title="Jump to video time"
                                >
                                    <Play className="w-3 h-3" />
                                    {formatTime(note.timestamp)}
                                </button>
                                <div className="flex-1">
                                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{note.content}</p>
                                </div>
                                <button onClick={() => handleDelete(note._id)} className="text-slate-600 hover:text-red-400 transition-colors shrink-0">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NoteSection;
