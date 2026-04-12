import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, BookOpen, Users, Clock } from "lucide-react";
import { getInstructorAnalytics } from "../api/services/analyticsService.js";

const InstructorAnalyticsPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getInstructorAnalytics();
        // API response: { success, message, data: { courses, totalRevenue, totalSales } }
        setSummary(res?.data || res);
      } catch (e) {
        console.error(e);
        setError("Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const courses = summary?.courses || [];
  const totalRevenue = summary?.totalRevenue || 0;
  const totalSales = summary?.totalSales || 0;
  const totalViews = courses.reduce((acc, c) => acc + (c.totalViews || 0), 0);
  const totalCompletions = courses.reduce((acc, c) => acc + (c.totalCompletions || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12 pt-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-heading font-black text-slate-50 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-indigo-400" />
            Analytics
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Performance of your programs across revenue, engagement, and completions.
          </p>
        </div>
        <Link
          to="/instructor"
          className="inline-flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200"
        >
          Back to instructor dashboard
        </Link>
      </div>

      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800 rounded-2xl h-24 animate-pulse"
            />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-900/30 border border-red-700 text-red-200 rounded-2xl p-4 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Summary stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={BookOpen}
              label="Active programs"
              value={courses.length}
              accent="bg-indigo-600"
            />
            <StatCard
              icon={Users}
              label="Total sales"
              value={totalSales.toLocaleString("en-IN")}
              accent="bg-emerald-600"
            />
            <StatCard
              icon={Clock}
              label="Total views"
              value={totalViews.toLocaleString("en-IN")}
              accent="bg-sky-600"
            />
            <StatCard
              icon={BarChart3}
              label="Revenue"
              value={`₹${totalRevenue.toLocaleString("en-IN")}`}
              accent="bg-violet-600"
            />
          </div>

          {/* Per-course table */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mt-6">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-50">Course performance</h2>
              <p className="text-[11px] text-slate-500">
                Aggregated across all time from your analytics events.
              </p>
            </div>
            {courses.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-500">
                No analytics yet. Once learners start buying and watching your programs,
                you&apos;ll see performance here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-900 text-slate-400 border-b border-gray-800">
                    <tr>
                      <th className="text-left px-6 py-3">Course</th>
                      <th className="text-right px-6 py-3">Revenue</th>
                      <th className="text-right px-6 py-3">Sales</th>
                      <th className="text-right px-6 py-3">Views</th>
                      <th className="text-right px-6 py-3">Completions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {courses.map((c) => (
                      <tr key={c.courseId}>
                        <td className="px-6 py-3 text-slate-100 max-w-xs truncate">
                          {c.courseTitle || "Untitled program"}
                        </td>
                        <td className="px-6 py-3 text-right text-emerald-300">
                          ₹{(c.totalRevenue || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="px-6 py-3 text-right text-slate-200">
                          {(c.totalSales || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="px-6 py-3 text-right text-slate-300">
                          {(c.totalViews || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="px-6 py-3 text-right text-slate-300">
                          {(c.totalCompletions || 0).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-4"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">
        {label}
      </p>
      <p className="text-lg font-bold text-slate-50 mt-0.5">{value}</p>
    </div>
  </motion.div>
);

export default InstructorAnalyticsPage;

