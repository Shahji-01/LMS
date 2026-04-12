import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPurchaseStatus } from "../api/services/purchaseService.js";
import { CheckCircle, Clock, XCircle, Play } from "lucide-react";

const CourseStatusPage = () => {
  const { courseId } = useParams();
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await getPurchaseStatus(courseId);
        setStatusData(data?.data || data);
      } catch {
        setError("Could not fetch purchase status.");
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [courseId]);

  const status = statusData?.status;
  const isCompleted = status === "completed";
  const isPending = status === "pending";
  const isFailed = status === "failed";

  return (
    <div className="min-h-screen pt-12 pb-24 px-6 flex items-center justify-center bg-slate-50 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="card p-8 sm:p-10 text-center relative overflow-hidden shadow-2xl shadow-blue-500/5">
          {/* Subtle decoration */}
          <div className={`absolute -top-32 -right-32 w-64 h-64 rounded-full blur-3xl pointer-events-none ${isCompleted ? "bg-emerald-400/20" : isPending ? "bg-yellow-400/20" : "bg-red-400/20"
            }`}
          />

          {loading && (
            <div className="flex flex-col items-center justify-center py-10 relative z-10">
              <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin mb-4" />
              <p className="text-slate-500 font-medium tracking-wide">Looking up your order...</p>
            </div>
          )}

          {error && (
            <div className="py-10 relative z-10">
              <div className="w-20 h-20 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-heading font-black text-slate-900 mb-2">Oops! Error</h2>
              <p className="text-slate-500 font-medium leading-relaxed">{error}</p>
              <Link to="/dashboard" className="btn-secondary w-full mt-8 h-12">Return to Dashboard</Link>
            </div>
          )}

          {!loading && !error && (
            <div className="relative z-10">

              {/* Animated Status Icon */}
              <div className="flex justify-center mb-6">
                {isCompleted && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-400 blur-xl opacity-40 animate-pulse rounded-full" />
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-400 to-emerald-300 shadow-lg shadow-emerald-500/30 flex items-center justify-center text-white relative z-10 animate-bounce-slight">
                      <CheckCircle className="w-12 h-12" />
                    </div>
                  </div>
                )}
                {isPending && (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-300 shadow-lg shadow-yellow-500/30 flex items-center justify-center text-white animate-pulse">
                    <Clock className="w-12 h-12" />
                  </div>
                )}
                {isFailed && (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-rose-500 to-red-400 shadow-lg shadow-rose-500/30 flex items-center justify-center text-white">
                    <XCircle className="w-12 h-12" />
                  </div>
                )}
              </div>

              {/* Status Header */}
              <h2 className="text-3xl font-heading font-black text-slate-900 tracking-tight mb-2">
                {isCompleted ? "Payment Successful!" : isPending ? "Payment Pending" : "Payment Failed"}
              </h2>

              <p className="text-slate-500 text-[15px] mb-8">
                {isCompleted && "Your order is complete. You now have lifetime access to the course."}
                {isPending && "We are waiting for confirmation from your payment provider. This usually takes a few minutes."}
                {isFailed && "Unfortunately, your transaction could not be processed. Please try another payment method."}
              </p>

              <div className="h-px w-full bg-slate-100 mb-8" />

              {/* Course info */}
              {statusData?.course && (
                <div className="mb-8 text-left bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-white border border-slate-200 shadow-sm relative">
                    {statusData.course.thumbnail ? (
                      <img
                        src={statusData.course.thumbnail}
                        alt={statusData.course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-300">
                        <Play className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1 block">Purchased Course</span>
                    <p className="font-heading font-bold text-slate-900 leading-tight line-clamp-2">{statusData.course.title}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                {isCompleted && (
                  <Link
                    to={`/course-progress/${courseId}`}
                    className="btn-primary w-full h-14 text-base shadow-lg shadow-emerald-500/30 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 border-none group gap-2"
                  >
                    Start Learning Now <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </Link>
                )}

                {isPending && (
                  <button onClick={() => window.location.reload()} className="btn-secondary w-full h-12 gap-2">
                    <Clock className="w-5 h-5" /> Refresh Status
                  </button>
                )}

                {isFailed && (
                  <Link
                    to={`/checkout/${courseId}`}
                    className="btn-primary w-full h-14 text-base shadow-lg shadow-blue-500/25 gap-2"
                  >
                    Try Payment Again
                  </Link>
                )}

                <Link
                  to="/purchases"
                  className="btn-ghost w-full h-12 text-slate-500 hover:text-slate-900"
                >
                  View Order History
                </Link>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CourseStatusPage;
