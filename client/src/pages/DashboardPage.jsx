import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPurchasedCourses } from "../api/services/purchaseService";
import { CourseGridSkeleton } from "../components/SkeletonLoader";
import EmptyState from "../components/EmptyState";
import CourseCard from "../components/CourseCard";
import StatCard from "../components/ui/StatCard";
import PageHeader from "../components/ui/PageHeader";
import { BookOpen, Trophy, ShieldCheck, ArrowRight } from "lucide-react";

const DashboardPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPurchasedCourses()
      .then((d) => setCourses(d?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const accountLabel = user?.role === "instructor"
    ? "Instructor"
    : user?.role === "admin"
    ? "Admin"
    : "Pro Learner";

  const accountLink = user?.role === "instructor"
    ? "/instructor"
    : user?.role === "admin"
    ? "/admin/dashboard"
    : null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">

      {/* Greeting */}
      <PageHeader
        title={`${greeting()}, ${user?.name?.split(" ")[0] || "there"} 👋`}
        subtitle="Pick up right where you left off."
        action={
          <Link to="/courses" className="btn-secondary text-sm">
            Browse Catalog
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          icon={BookOpen}
          label="Active Enrollments"
          value={courses.length}
          color="blue"
          delay={0}
        />
        <StatCard
          icon={Trophy}
          label="Courses Completed"
          value={courses.filter((c) => c.progress === 100).length}
          color="emerald"
          sub="Keep going!"
          delay={0.05}
        />
        <StatCard
          icon={ShieldCheck}
          label="Account Type"
          value={accountLabel}
          color="violet"
          to={accountLink}
          delay={0.1}
        />
      </div>

      {/* Recent Courses */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold font-heading text-slate-900">Jump Back In</h2>
          <Link
            to="/dashboard/my-courses"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
          >
            View library <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <CourseGridSkeleton count={3} />
        ) : courses.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
            <EmptyState
              title="Your library is empty"
              description="You haven't enrolled in any courses yet. Browse the curriculum to get started."
              actionLabel="Explore Curriculum"
              actionTo="/courses"
            />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.slice(0, 3).map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                to={`/course-progress/${course._id}`}
                showProgress
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
