import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const DEFAULT_COURSES = [
  {
    _id: "1",
    title: "Full Stack Web Development",
    subtitle: "Learn MERN stack from scratch",
    level: "beginner",
    totalLectures: 120,
    thumbnail:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
  },
  {
    _id: "2",
    title: "Data Structures & Algorithms",
    subtitle: "Crack coding interviews with confidence",
    level: "intermediate",
    totalLectures: 90,
    thumbnail:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
  },
  {
    _id: "3",
    title: "UI/UX Design Fundamentals",
    subtitle: "Design modern, user-friendly interfaces",
    level: "beginner",
    totalLectures: 60,
    thumbnail:
      "https://images.unsplash.com/photo-1559028012-481c04fa702d",
  },
];

const MyCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API delay
    setTimeout(() => {
      setCourses(DEFAULT_COURSES);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10">
          <div>
            <h2 className="text-3xl font-semibold">
              My Courses
            </h2>
            <p className="text-gray-600 mt-2">
              Manage and edit the courses you’ve created
            </p>
          </div>

          <Link
            to="/dashboard/courses/create"
            className="mt-4 sm:mt-0 inline-flex items-center px-5 py-2.5
                       rounded-xl bg-black text-white font-medium
                       hover:bg-black/90 transition"
          >
            + Create New Course
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <p className="text-gray-600">Loading your courses...</p>
        ) : courses.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <p className="text-gray-600 mb-4">
              You haven’t created any courses yet.
            </p>
            <Link
              to="/dashboard/courses/create"
              className="inline-block px-5 py-2.5 rounded-xl bg-black text-white font-medium
                         hover:bg-black/90 transition"
            >
              Create your first course
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden"
              >
                {/* Thumbnail */}
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="h-44 w-full object-cover"
                />

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold mb-1">
                    {course.title}
                  </h3>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {course.subtitle}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span className="capitalize">{course.level}</span>
                    <span>{course.totalLectures} lectures</span>
                  </div>

                  <Link
                    to={`/dashboard/courses/${course._id}/edit`}
                    className="inline-block w-full text-center py-2 rounded-xl
                               border border-gray-300 text-sm font-medium
                               hover:bg-gray-100 transition"
                  >
                    Edit Course
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default MyCoursesPage;
