import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const DEFAULT_COURSES = [
  {
    _id: "1",
    title: "Full Stack Web Development",
    subtitle: "Learn MERN stack from scratch",
    category: "Web Development",
    level: "beginner",
    price: 1999,
    thumbnail:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
    totalLectures: 120,
    totalDuration: 40,
  },
  {
    _id: "2",
    title: "Data Structures & Algorithms",
    subtitle: "Crack coding interviews confidently",
    category: "Programming",
    level: "intermediate",
    price: 2499,
    thumbnail:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
    totalLectures: 90,
    totalDuration: 35,
  },
  {
    _id: "3",
    title: "UI/UX Design Fundamentals",
    subtitle: "Design beautiful and usable interfaces",
    category: "Design",
    level: "beginner",
    price: 1499,
    thumbnail:
      "https://images.unsplash.com/photo-1559028012-481c04fa702d",
    totalLectures: 60,
    totalDuration: 25,
  },
];

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // Simulate API delay
    setTimeout(() => {
      setCourses(DEFAULT_COURSES);
    }, 500);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold">
            All Published Courses
          </h1>
          <p className="text-gray-600 mt-2">
            Explore high-quality courses taught by expert instructors
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course._id}
              to={`/courses/${course._id}`}
              className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition"
            >
              {/* Thumbnail */}
              <img
                src={course.thumbnail}
                alt={course.title}
                className="h-48 w-full object-cover"
              />

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span className="capitalize">{course.level}</span>
                  <span>{course.category}</span>
                </div>

                <h2 className="text-lg font-semibold group-hover:underline">
                  {course.title}
                </h2>

                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {course.subtitle}
                </p>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                  <span>{course.totalLectures} lectures</span>
                  <span>{course.totalDuration} hrs</span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-semibold">
                    ₹{course.price}
                  </span>
                  <span className="text-sm font-medium text-black">
                    View →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
};

export default CoursesPage;
