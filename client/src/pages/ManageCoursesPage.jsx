import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Search, Trash2, Eye, AlertCircle, ChevronRight, LayoutGrid } from "lucide-react";
import axiosInstance from "../api/axios.js";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const ManageCoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [cursor, setCursor] = useState(null);
    const [hasMore, setHasMore] = useState(false);

    const fetchCourses = async (reset = true) => {
        try {
            setLoading(true);
            const params = { limit: 20 };
            if (!reset && cursor) params.cursor = cursor;

            const res = await axiosInstance.get("/admin/courses", { params });
            const { data, nextCursor } = res.data.data;

            setCourses(reset ? data : (prev) => [...prev, ...data]);
            setCursor(nextCursor || null);
            setHasMore(!!nextCursor);
        } catch (err) {
            toast.error(err.response?.data?.error?.message || "Failed to load courses");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCourses(true); }, []);

    const handleDelete = async (courseId) => {
        if (!confirm("Remove this course from the platform?")) return;
        try {
            await axiosInstance.delete(`/admin/courses/${courseId}`);
            setCourses((prev) => prev.filter((c) => c._id !== courseId));
            toast.success("Course removed");
        } catch {
            toast.error("Failed to remove course");
        }
    };

    const filtered = courses.filter(
        (c) =>
            !search ||
            c.title?.toLowerCase().includes(search.toLowerCase()) ||
            c.category?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 sm:p-8 min-h-[80vh]">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                        <BookOpen size={20} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-2xl font-heading font-black text-slate-900 tracking-tight">Manage Courses</h1>
                </div>
                <p className="text-slate-500 text-sm font-medium ml-14">Moderate and remove platform courses.</p>
            </motion.div>

            {/* Search */}
            <div className="relative mb-8 max-w-sm">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search courses..."
                    className="w-full pl-11 pr-4 h-12 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all shadow-sm"
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading && !courses.length
                    ? [...Array(8)].map((_, i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm animate-pulse">
                            <div className="h-44 bg-slate-100" />
                            <div className="p-5 space-y-3">
                                <div className="h-4 bg-slate-100 rounded-md w-3/4" />
                                <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                            </div>
                        </div>
                    ))
                    : filtered.map((course) => (
                        <motion.div
                            key={course._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-200 transition-all group flex flex-col"
                        >
                            <div className="relative h-44 bg-slate-100 overflow-hidden">
                                {course.thumbnail ? (
                                    <img
                                        src={course.thumbnail}
                                        alt={course.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                        <LayoutGrid size={32} />
                                    </div>
                                )}
                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-700 shadow-sm border border-slate-200/50">
                                    {course.category}
                                </div>
                                <div className="absolute top-3 right-3">
                                    <span className={`text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-lg font-bold shadow-sm border ${course.isPublished ? "bg-emerald-50 text-emerald-600 border-emerald-200/50" : "bg-slate-50 text-slate-500 border-slate-200/50"}`}>
                                        {course.isPublished ? "Published" : "Draft"}
                                    </span>
                                </div>
                            </div>
                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="text-slate-900 font-bold text-[15px] leading-snug line-clamp-2 mb-3 mt-1 group-hover:text-blue-600 transition-colors">
                                    {course.title}
                                </h3>
                                
                                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between mb-4">
                                    <span className="text-xs font-semibold text-slate-500 truncate max-w-[120px]">
                                        By {course.instructor?.name || 'Unknown'}
                                    </span>
                                    <span className="text-sm font-black text-slate-900">
                                        ₹{course.price}
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <Link
                                        to={`/course-details/${course._id}`}
                                        className="flex-1 flex items-center justify-center gap-1.5 h-10 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-colors"
                                    >
                                        <Eye size={14} /> Preview
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(course._id)}
                                        className="w-10 h-10 flex items-center justify-center bg-rose-50 border border-rose-100 hover:bg-rose-100 rounded-xl text-rose-600 transition-colors"
                                        title="Delete Course"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
            </div>

            {!loading && !filtered.length && (
                <div className="py-20 text-center bg-white border border-slate-200 rounded-3xl mt-4">
                    <AlertCircle size={40} className="text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900">No Courses Found</h3>
                    <p className="text-sm text-slate-500 mt-1">Try adjusting your search criteria.</p>
                </div>
            )}

            {hasMore && (
                <div className="mt-8 text-center">
                    <button
                        onClick={() => fetchCourses(false)}
                        className="h-10 px-5 inline-flex items-center gap-2 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        Load More Courses <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ManageCoursesPage;
