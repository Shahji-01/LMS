import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPurchasedCourses } from "../api/services/purchaseService.js";
import { ShoppingCart, Play, Clock, XCircle, ArrowLeft, Loader2, CreditCard } from "lucide-react";
import { optimizeImage } from "../utils/optimizeCloudinaryUrl.js";
import { motion } from "framer-motion";

const PurchasesPage = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPurchasedCourses();
        setPurchases(data?.data || []);
      } catch {
        setError("Failed to load your purchases.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }}
      className="min-h-[80vh] pt-10 pb-20 px-6 sm:px-8 max-w-5xl mx-auto w-full"
    >
      {/* Header */}
      <div className="mb-10">
        <Link to="/dashboard" className="text-sm font-bold text-slate-500 hover:text-blue-600 mb-4 inline-flex items-center gap-1 group transition-colors">
          <ArrowLeft size={16} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl sm:text-4xl font-heading font-black text-slate-900 tracking-tight">Order History</h1>
        <p className="text-slate-500 mt-2 text-lg font-medium">View and manage your recent course purchases and receipts.</p>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
          <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Loading your orders...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-8 text-center shadow-sm">
          <p className="text-red-500 font-bold">{error}</p>
        </div>
      )}

      {!loading && !error && purchases.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-6 shadow-inner">
            <ShoppingCart size={32} strokeWidth={2.5} />
          </div>
          <h3 className="text-xl font-heading font-black text-slate-900 mb-2">No Purchases Yet</h3>
          <p className="text-slate-500 font-medium max-w-md mx-auto mb-8">
            You haven't bought any courses yet. Explore our library to start your learning journey.
          </p>
          <Link
            to="/courses"
            className="btn-primary shadow-lg shadow-blue-500/20 px-8 h-12 rounded-xl text-sm"
          >
            Browse Courses
          </Link>
        </div>
      )}

      {!loading && !error && purchases.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {purchases.map((purchase) => {
              const course = purchase.course || purchase;
              const status = purchase.status || "completed";

              const isCompleted = status === "completed";
              const isPending = status === "pending";

              return (
                <li key={purchase._id || course._id} className="group hover:bg-slate-50/50 transition-colors p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">

                  <div className="flex items-start gap-5 flex-1 min-w-0">
                    <div className="shrink-0 w-28 sm:w-36 aspect-video rounded-xl overflow-hidden bg-slate-100 shadow-sm border border-slate-200 relative group-hover:shadow-md transition-shadow">
                      {course.thumbnail ? (
                        <img
                          src={optimizeImage(course.thumbnail, 400, 225)}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium text-xs">
                          No Image
                        </div>
                      )}

                      {/* Status Overlay for non-completed */}
                      {!isCompleted && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                          {isPending ? <Clock size={24} className="text-yellow-600" /> : <XCircle size={24} className="text-red-500" />}
                        </div>
                      )}
                    </div>

                    <div className="pt-1 min-w-0 flex flex-col justify-center">
                      <p className="font-heading font-black text-lg text-slate-900 truncate pr-4">{course.title}</p>
                      <p className="text-[13px] font-bold text-blue-600 uppercase tracking-wider mt-1 mb-3">
                        {course.category} <span className="text-slate-300 mx-1">•</span> <span className="text-slate-500">{course.level}</span>
                      </p>

                      <div className="flex items-center gap-3 mt-auto">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${isCompleted
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                          : isPending
                            ? "bg-yellow-50 text-yellow-600 border-yellow-200"
                            : "bg-rose-50 text-rose-600 border-rose-200"
                          }`}>
                          {status}
                        </span>

                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <CreditCard size={12} /> ID: {(purchase._id || course._id).slice(-6)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 shrink-0 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {isCompleted ? (
                      <Link
                        to={`/course-progress/${course._id}`}
                        className="btn-primary py-2.5 px-6 rounded-xl shadow-md shadow-blue-500/20 active:scale-[0.98] transition-transform flex items-center gap-2 text-sm"
                      >
                        Continue <Play size={14} fill="currentColor" />
                      </Link>
                    ) : isPending ? (
                      <button disabled className="btn-secondary opacity-50 cursor-not-allowed py-2.5 px-6 rounded-xl flex items-center gap-2 text-sm bg-slate-100 border-slate-200 text-slate-500">
                        <Loader2 size={14} className="animate-spin" /> Processing
                      </button>
                    ) : (
                      <Link
                        to={`/checkout/${course._id}`}
                        className="btn-secondary py-2.5 px-6 rounded-xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors flex items-center gap-2 text-sm text-slate-700 bg-white border-slate-200 shadow-sm"
                      >
                        Try Again
                      </Link>
                    )}
                  </div>

                </li>
              );
            })}
          </ul>
        </div>
      )}

    </motion.div>
  );
};

export default PurchasesPage;
