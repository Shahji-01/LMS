import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Users, BookOpen, DollarSign, TrendingUp, Activity } from "lucide-react";
import axiosInstance from "../api/axios.js";
import { Link } from "react-router-dom";
import StatCard from "../components/ui/StatCard";
import PageHeader from "../components/ui/PageHeader";
import { StatsSkeleton } from "../components/SkeletonLoader";

const AdminDashboard = () => {
  const { user } = useSelector((s) => s.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/admin/stats")
      .then((r) => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">

      <PageHeader
        title="Admin Dashboard"
        subtitle="Platform overview and management tools."
      />

      {/* Stats */}
      {loading ? (
        <StatsSkeleton count={4} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            icon={Users}
            label="Total Users"
            value={stats?.totalUsers?.toLocaleString()}
            color="blue"
            delay={0}
          />
          <StatCard
            icon={BookOpen}
            label="Total Courses"
            value={stats?.totalCourses?.toLocaleString()}
            color="emerald"
            delay={0.05}
          />
          <StatCard
            icon={DollarSign}
            label="Total Revenue"
            value={stats?.totalRevenue ? `₹${Number(stats.totalRevenue).toLocaleString("en-IN")}` : "₹0"}
            color="violet"
            delay={0.1}
          />
          <StatCard
            icon={TrendingUp}
            label="Recent Sales"
            value={stats?.recentPurchases?.length ?? 0}
            color="orange"
            delay={0.15}
          />
        </div>
      )}

      {/* Bottom Grid */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Recent Purchases */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold font-heading text-slate-900 mb-5 flex items-center gap-2">
            <Activity size={17} className="text-emerald-500" />
            Recent Purchases
          </h2>
          {stats?.recentPurchases?.length ? (
            <div className="space-y-3">
              {stats.recentPurchases.slice(0, 5).map((p) => (
                <div key={p._id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                  <img
                    src={
                      p.user?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(p.user?.name || "U")}&background=6366f1&color=fff&size=40`
                    }
                    alt={p.user?.name}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {p.user?.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{p.course?.title}</p>
                  </div>
                  <span className="text-emerald-600 text-sm font-bold font-heading shrink-0">
                    ₹{(p.amount || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center py-6">
              No recent purchases yet.
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold font-heading text-slate-900 mb-5">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { to: "/admin/users", label: "Manage Users", desc: "View and edit user roles & accounts", icon: Users, color: "blue" },
              { to: "/admin/courses", label: "Manage Courses", desc: "Review and moderate course content", icon: BookOpen, color: "emerald" },
              { to: "/admin/categories", label: "Categories", desc: "Add or edit course categories", icon: TrendingUp, color: "violet" },
              { to: "/admin/coupons", label: "Coupons", desc: "Create and manage discount codes", icon: DollarSign, color: "orange" },
            ].map(({ to, label, desc, icon: Icon, color }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  color === "blue" ? "bg-blue-50 text-blue-600" :
                  color === "emerald" ? "bg-emerald-50 text-emerald-600" :
                  color === "violet" ? "bg-violet-50 text-violet-600" :
                  "bg-orange-50 text-orange-600"
                } group-hover:scale-110 transition-transform`}>
                  <Icon size={17} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-semibold font-heading text-slate-900">{label}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
