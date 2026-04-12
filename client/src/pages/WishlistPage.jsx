import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getMyWishlist, toggleWishlist } from "../api/services/wishlistService";
import { useAuth } from "../context/AuthContext";
import CourseCard from "../components/CourseCard";
import { CourseCardSkeleton } from "../components/SkeletonLoader";
import EmptyState from "../components/EmptyState";
import { Heart } from "lucide-react";

const WishlistPage = () => {
    const { isAuthenticated } = useAuth();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWishlist = useCallback(async () => {
        try {
            const res = await getMyWishlist();
            setWishlist(res.data || []);
        } catch {
            setWishlist([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchWishlist();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, fetchWishlist]);

    const handleRemove = async (courseId) => {
        try {
            await toggleWishlist(courseId);
            fetchWishlist();
        } catch {}
    };

    if (loading) {
        return (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {[1, 2, 3].map(i => <CourseCardSkeleton key={i} />)}
            </div>
        );
    }

    if (!wishlist.length) {
        return (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
                <EmptyState
                    icon={Heart}
                    title="Your Wishlist is Empty"
                    description="Explore courses and click the heart icon to save them for later."
                    actionLabel="Explore Courses"
                    onAction={() => window.location.href = "/courses"}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-heading font-bold text-slate-900">My Wishlist ({wishlist.length})</h1>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map(({ course, _id }) => (
                    <div key={_id} className="relative group">
                        <CourseCard course={course} />
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                handleRemove(course._id);
                            }}
                            className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md hover:bg-red-50 text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            title="Remove from wishlist"
                        >
                            <Heart className="w-5 h-5 fill-red-500" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WishlistPage;
