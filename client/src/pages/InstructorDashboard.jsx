import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyCreatedCourses } from "../api/services/courseService";
import { TableSkeleton } from "../components/SkeletonLoader";
import EmptyState from "../components/EmptyState";
import StatCard from "../components/ui/StatCard";
import PageHeader from "../components/ui/PageHeader";
import Badge from "../components/ui/Badge";
import { Plus, Pencil, List, Eye, BookOpen, Users, TrendingUp } from "lucide-react";
import { toast } from "react-hot-toast";

const levelVariant = { beginner: "emerald", intermediate: "orange", advanced: "red" };

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyCreatedCourses()
      .then((d) => setCourses(d?.data || []))
      .catch(() => toast.error("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  const published = courses.filter((c) => c.isPublished).length;
  const totalStudents = courses.reduce((acc, c) => acc + (c.enrolledStudents?.length || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">

      <PageHeader
        title="Instructor Dashboard"
        subtitle="Manage your curriculum and track your impact."
        action={
          <Link to="/instructor/create-course" className="btn-primary text-sm">
            <Plus size={16} />
            Create Course
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-5">
        <StatCard icon={BookOpen} label="Total Courses" value={courses.length} color="blue" delay={0} />
        <StatCard
          icon={Eye}
          label="Published"
          value={published}
          sub={`${courses.length - published} drafts`}
          color="emerald"
          delay={0.05}
        />
        <StatCard
          icon={Users}
          label="Total Students"
          value={totalStudents.toLocaleString()}
          color="violet"
          delay={0.1}
        />
      </div>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          to="/instructor/analytics"
          className="p-5 bg-white border border-slate-200 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all flex items-center gap-4 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <TrendingUp size={20} strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-semibold font-heading text-slate-900">Analytics</p>
            <p className="text-sm text-slate-500">View enrollment & performance data</p>
          </div>
        </Link>
        <Link
          to="/instructor/revenue"
          className="p-5 bg-white border border-slate-200 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all flex items-center gap-4 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
            <TrendingUp size={20} strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-semibold font-heading text-slate-900">Revenue</p>
            <p className="text-sm text-slate-500">Track your earnings and payouts</p>
          </div>
        </Link>
      </div>

      {/* Courses Table */}
      <div>
        <h2 className="text-lg font-bold font-heading text-slate-900 mb-4">Your Curriculum</h2>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <TableSkeleton rows={4} />
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
            <EmptyState
              title="No courses yet"
              description="Create your first course and start building your curriculum."
              actionLabel="Create Course"
              actionTo="/instructor/create-course"
            />
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th className="hidden md:table-cell">Students</th>
                  <th className="hidden sm:table-cell">Status</th>
                  <th className="hidden sm:table-cell">Price</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course._id}>
                    <td>
                      <div className="flex items-center gap-3.5">
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt=""
                            className="w-12 h-9 rounded-lg object-cover shrink-0 border border-slate-100"
                          />
                        ) : (
                          <div className="w-12 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <BookOpen size={16} className="text-slate-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold font-heading text-slate-900 truncate text-[13px]">
                            {course.title}
                          </p>
                          <Badge variant={levelVariant[course.level] || "slate"} size="sm" className="mt-0.5">
                            {course.level}
                          </Badge>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell text-slate-700 font-medium">
                      {(course.enrolledStudents?.length || 0).toLocaleString()}
                    </td>
                    <td className="hidden sm:table-cell">
                      <Badge variant={course.isPublished ? "emerald" : "slate"} dot>
                        {course.isPublished ? "Live" : "Draft"}
                      </Badge>
                    </td>
                    <td className="hidden sm:table-cell font-semibold text-slate-900 text-[13px]">
                      {course.price ? `₹${course.price.toLocaleString("en-IN")}` : "Free"}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/instructor/course/${course._id}/edit`}
                          className="btn-icon hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                          title="Edit Course"
                        >
                          <Pencil size={15} />
                        </Link>
                        <Link
                          to={`/instructor/course/${course._id}/lectures`}
                          className="btn-icon hover:text-cyan-600 hover:bg-cyan-50 rounded-xl"
                          title="Manage Lectures"
                        >
                          <List size={15} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;
