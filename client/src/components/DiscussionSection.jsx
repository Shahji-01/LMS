import React, { useState, useEffect } from "react";
import { getDiscussions, createDiscussion, deleteDiscussion } from "../api/services/discussionService";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { User, Trash2, MessageSquareText } from "lucide-react";

const DiscussionSection = ({ courseId, lectureId }) => {
    const { user, isAuthenticated } = useAuth();
    const [discussions, setDiscussions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState("");
    const [replyContent, setReplyContent] = useState({}); // { threadId: text }
    const [activeReplyFrame, setActiveReplyFrame] = useState(null); // threadId
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!lectureId) return;
        fetchDiscussions();
    }, [lectureId]);

    const fetchDiscussions = async () => {
        try {
            setLoading(true);
            const res = await getDiscussions(lectureId);
            setDiscussions(res.data || []);
        } catch {
            // fail silently
        } finally {
            setLoading(false);
        }
    };

    const handlePost = async (e, parentThread = null) => {
        e.preventDefault();
        const text = parentThread ? replyContent[parentThread] : content;
        if (!text?.trim()) return;

        setSubmitting(true);
        try {
            await createDiscussion(courseId, lectureId, { content: text, parentThread });
            toast.success(parentThread ? "Reply posted!" : "Question posted!");
            if (parentThread) {
                setReplyContent({ ...replyContent, [parentThread]: "" });
                setActiveReplyFrame(null);
            } else {
                setContent("");
            }
            fetchDiscussions();
        } catch (err) {
            toast.error(err.response?.data?.error?.message || "Failed to post discussion.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (discussionId) => {
        if (!window.confirm("Delete this post?")) return;
        try {
            await deleteDiscussion(discussionId);
            toast.success("Post deleted.");
            fetchDiscussions();
        } catch {
            toast.error("Failed to delete post.");
        }
    };

    if (loading) return <div className="animate-pulse h-32 bg-slate-800 rounded-2xl w-full" />;

    return (
        <div className="bg-slate-900 border border-white/5 rounded-[2rem] p-6 lg:p-10 text-slate-300 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
                <MessageSquareText className="w-8 h-8 text-blue-500" />
                <h2 className="text-2xl font-heading font-bold text-white tracking-tight">Q&A Discussions</h2>
            </div>

            {/* Main Input Form */}
            {isAuthenticated ? (
                <form onSubmit={(e) => handlePost(e)} className="mb-10 bg-slate-800/50 p-4 rounded-xl border border-white/5">
                    <textarea
                        className="w-full bg-slate-950 text-slate-300 placeholder-slate-500 border border-slate-700/50 rounded-lg p-4 focus:outline-none focus:border-blue-500 min-h-[100px] resize-y transition-colors"
                        placeholder="Ask a question or share a thought about this lecture..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        maxLength={1000}
                    />
                    <div className="mt-4 flex justify-end">
                        <button type="submit" disabled={submitting || !content.trim()} className="btn-primary text-sm px-6 py-2.5">
                            {submitting ? "Posting..." : "Post Question"}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="mb-10 p-6 bg-slate-800/50 rounded-xl text-center border border-white/5">
                    <p className="text-sm text-slate-400">You must be signed in to participate in the discussion.</p>
                </div>
            )}

            {/* Threads */}
            <div className="space-y-8">
                {discussions.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center italic py-8">
                        No discussions yet. Be the first to start a conversation!
                    </p>
                ) : (
                    discussions.map((thread) => (
                        <div key={thread._id} className="p-5 bg-slate-800/20 border border-white/5 rounded-2xl">
                            {/* Top-Level Thread */}
                            <div className="flex gap-4 items-start">
                                <img
                                    src={thread.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(thread.user?.name || "U")}&background=1e293b&color=cbd5e1`}
                                    alt=""
                                    className="w-10 h-10 rounded-full border border-slate-700"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-200 text-sm">{thread.user?.name}</span>
                                            {thread.user?.role === "instructor" && (
                                                <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                                                    Instructor
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-slate-500">{new Date(thread.createdAt).toLocaleDateString()}</span>
                                            {(user?._id === thread.user?._id || user?.role === "instructor") && (
                                                <button onClick={() => handleDelete(thread._id)} className="text-slate-500 hover:text-red-400 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-slate-300 text-sm mt-2 leading-relaxed whitespace-pre-wrap">{thread.content}</p>
                                    
                                    <div className="mt-4 flex gap-4">
                                        <button 
                                            onClick={() => setActiveReplyFrame(activeReplyFrame === thread._id ? null : thread._id)}
                                            className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                                        >
                                            Reply
                                        </button>
                                    </div>

                                    {/* Reply Input */}
                                    {activeReplyFrame === thread._id && (
                                        <form onSubmit={(e) => handlePost(e, thread._id)} className="mt-4 flex gap-3">
                                            <img
                                                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=1e293b&color=cbd5e1`}
                                                alt=""
                                                className="w-8 h-8 rounded-full border border-slate-700 hidden sm:block"
                                            />
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    className="w-full bg-slate-900 text-sm text-slate-300 border border-slate-700 rounded-lg px-4 py-2 hover:border-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                                                    placeholder="Write a reply..."
                                                    value={replyContent[thread._id] || ""}
                                                    onChange={(e) => setReplyContent({ ...replyContent, [thread._id]: e.target.value })}
                                                />
                                            </div>
                                            <button type="submit" disabled={submitting || !replyContent[thread._id]?.trim()} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg border border-slate-700 transition-colors disabled:opacity-50">
                                                Post
                                            </button>
                                        </form>
                                    )}

                                    {/* Replies List */}
                                    {thread.replies?.length > 0 && (
                                        <div className="mt-6 space-y-5 pl-4 border-l-2 border-slate-800">
                                            {thread.replies.map((reply) => (
                                                <div key={reply._id} className="flex gap-3 items-start">
                                                    <img
                                                        src={reply.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.user?.name || "U")}&background=1e293b&color=cbd5e1`}
                                                        alt=""
                                                        className="w-8 h-8 rounded-full border border-slate-700"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-wrap items-center justify-between gap-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-slate-300 text-sm md:text-xs">{reply.user?.name}</span>
                                                                {reply.user?.role === "instructor" && (
                                                                    <span className="bg-blue-500/20 text-blue-400 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                                                                        Instructor
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] text-slate-500">{new Date(reply.createdAt).toLocaleDateString()}</span>
                                                                {(user?._id === reply.user?._id || user?.role === "instructor") && (
                                                                    <button onClick={() => handleDelete(reply._id)} className="text-slate-500 hover:text-red-400 transition-colors">
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className="text-slate-400 text-xs md:text-sm mt-1 leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DiscussionSection;
