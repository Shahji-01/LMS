import React, { useState, useEffect } from "react";
import { getCourseReviews, upsertReview, deleteReview } from "../api/services/reviewService";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Star, Trash2 } from "lucide-react";

const ReviewSection = ({ courseId, isPurchased, instructorId }) => {
    const { user, isAuthenticated } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchReviews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    const fetchReviews = async () => {
        try {
            const res = await getCourseReviews(courseId);
            setReviews(res.data);

            // Pre-fill if user already reviewed
            if (user) {
                const userReview = res.data.find(r => r.user?._id === user._id);
                if (userReview) {
                    setRating(userReview.rating);
                    setComment(userReview.comment);
                }
            }
        } catch {
            // silent fail on fetch
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await upsertReview(courseId, { rating, comment });
            toast.success("Review posted successfully!");
            await fetchReviews();
        } catch (err) {
            toast.error(err.response?.data?.error?.message || "Failed to post review");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (reviewId) => {
        try {
            await deleteReview(reviewId);
            toast.success("Review deleted");
            setComment("");
            setRating(5);
            await fetchReviews();
        } catch {
            toast.error("Failed to delete review");
        }
    };

    const canReview = isAuthenticated && (isPurchased || user?._id === instructorId);

    if (loading) return <div className="animate-pulse h-32 bg-slate-100 rounded-2xl w-full" />;

    return (
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-200 mt-8">
            <h2 className="text-2xl font-heading font-bold text-slate-900 mb-8">Student Reviews</h2>

            {/* Review Form */}
            {canReview && (
                <div className="mb-10 p-6 bg-slate-50 border border-slate-100 rounded-xl">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 tracking-wide uppercase">Leave a Review</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                                    aria-label={`Rate ${star} stars`}
                                >
                                    <Star className={`w-8 h-8 ${star <= rating ? "text-amber-400 fill-amber-400" : "text-slate-200"} transition-colors`} />
                                </button>
                            ))}
                        </div>
                        <textarea
                            required
                            maxLength={500}
                            className="input min-h-[100px]"
                            placeholder="How was the course?"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <button type="submit" disabled={isSubmitting} className="btn-primary" aria-busy={isSubmitting}>
                            {isSubmitting ? "Posting..." : "Post Review"}
                        </button>
                    </form>
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
                {reviews.length === 0 ? (
                    <p className="text-slate-500 italic">No reviews yet. Be the first to review!</p>
                ) : (
                    reviews.map((rev) => (
                        <div key={rev._id} className="pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={rev.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(rev.user?.name || "U")}&background=94a3b8&color=fff`}
                                        className="w-10 h-10 rounded-full"
                                        alt=""
                                    />
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{rev.user?.name || "Student"}</p>
                                        <div className="flex gap-0.5 mt-0.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star key={star} className={`w-4 h-4 ${star <= rev.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                {user?._id === rev.user?._id && (
                                    <button
                                        onClick={() => handleDelete(rev._id)}
                                        className="text-slate-400 hover:text-red-500 transition-colors p-2"
                                        aria-label="Delete review"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                            <p className="text-slate-600 text-sm mt-3 leading-relaxed">{rev.comment}</p>
                            <p className="text-xs text-slate-400 mt-2">{new Date(rev.createdAt).toLocaleDateString()}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ReviewSection;
