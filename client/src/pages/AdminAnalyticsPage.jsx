import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart2, Activity, Eye, DollarSign } from "lucide-react";
import { getAdminAnalytics } from "../api/services/analyticsService.js";

const AdminAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAdminAnalytics();
        // API returns { success, message, data }
        setAnalytics(res?.data || res);
      } catch (e) {
        console.error(e);
        setError("Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const dailyRevenue = analytics?.dailyRevenue || [];
  const topCourses = analytics?.topCourses || [];

  return (
    <div className="p-8 text-white min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-1">
          <BarChart2 size={24} className="text-indigo-400" />
          <h1 className="text-2xl font-bold">Platform Analytics</h1>
        </div>
        <p className="text-gray-400 text-sm ml-9">
          Revenue and engagement trends across the platform
        </p>
      </motion.div>

      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800 rounded-2xl h-40 animate-pulse"
            />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-900/30 border border-red-700 text-red-200 rounded-2xl p-4 mb-6 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-8">
          {/* Daily revenue / views */}
          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-emerald-400" />
                <h2 className="text-base font-semibold">Last 30 days (daily)</h2>
              </div>
              <p className="text-xs text-gray-500">
                Revenue & views aggregated by day
              </p>
            </div>

            {dailyRevenue.length === 0 ? (
              <p className="text-gray-500 text-sm">No analytics data yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead className="text-gray-400 border-b border-gray-800">
                    <tr>
                      <th className="text-left py-2 pr-6">Date</th>
                      <th className="text-right py-2 pr-6">Revenue</th>
                      <th className="text-right py-2">Views</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {dailyRevenue.map((row) => (
                      <tr key={row._id}>
                        <td className="py-2 pr-6 text-gray-300">
                          {row._id}
                        </td>
                        <td className="py-2 pr-6 text-right text-emerald-300">
                          ₹{row.revenue?.toLocaleString("en-IN") ?? 0}
                        </td>
                        <td className="py-2 text-right text-gray-300">
                          {row.views?.toLocaleString("en-IN") ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Top courses */}
          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <DollarSign size={18} className="text-violet-400" />
                <h2 className="text-base font-semibold">Top 10 courses</h2>
              </div>
              <p className="text-xs text-gray-500">
                Ranked by total revenue in last 30 days
              </p>
            </div>

            {topCourses.length === 0 ? (
              <p className="text-gray-500 text-sm">No course analytics yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead className="text-gray-400 border-b border-gray-800">
                    <tr>
                      <th className="text-left py-2 pr-4">Course</th>
                      <th className="text-left py-2 pr-4">Instructor</th>
                      <th className="text-right py-2 pr-4">Revenue</th>
                      <th className="text-right py-2">
                        <Eye className="inline-block w-3 h-3 mr-1" />
                        Views
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {topCourses.map((row) => (
                      <tr key={row._id}>
                        <td className="py-2 pr-4 text-gray-200">
                          {row.course?.title || "Untitled course"}
                        </td>
                        <td className="py-2 pr-4 text-gray-400">
                          {row.course?.instructor?.name || "—"}
                        </td>
                        <td className="py-2 pr-4 text-right text-emerald-300">
                          ₹{row.totalRevenue?.toLocaleString("en-IN") ?? 0}
                        </td>
                        <td className="py-2 text-right text-gray-300">
                          {row.totalViews?.toLocaleString("en-IN") ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default AdminAnalyticsPage;

