import React from "react";
import { Link } from "react-router-dom";

const INSTRUCTOR_STATS = [
  { label: "Total Courses", value: 3 },
  { label: "Total Students", value: 124 },
  { label: "Published Courses", value: 2 },
  { label: "Revenue", value: "₹45,000" },
];

const INSTRUCTOR_COURSES = [
  {
    _id: "1",
    title: "Full Stack Web Development",
    students: 80,
    status: "published",
  },
  {
    _id: "2",
    title: "DSA Masterclass",
    students: 44,
    status: "draft",
  },
];

const InstructorDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10">
          <div>
            <h2 className="text-3xl font-semibold">Instructor Dashboard</h2>
            <p className="text-gray-600 mt-2">
              Manage courses and track performance
            </p>
          </div>

          <Link
            to="/dashboard/courses/create"
            className="mt-4 sm:mt-0 px-5 py-2.5 rounded-xl bg-black text-white font-medium
                       hover:bg-black/90 transition"
          >
            + Create Course
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {INSTRUCTOR_STATS.map((stat, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
            >
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-2xl font-semibold mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Courses */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-6">My Courses</h3>

          <div className="space-y-4">
            {INSTRUCTOR_COURSES.map((course) => (
              <div
                key={course._id}
                className="flex items-center justify-between border border-gray-100 rounded-xl p-4"
              >
                <div>
                  <p className="font-medium">{course.title}</p>
                  <p className="text-sm text-gray-600">
                    {course.students} students
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      course.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {course.status}
                  </span>

                  <Link
                    to={`/dashboard/courses/${course._id}/edit`}
                    className="text-sm font-medium text-black hover:underline"
                  >
                    Manage →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default InstructorDashboard;
