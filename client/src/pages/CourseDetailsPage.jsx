import React from "react";
import { useParams } from "react-router-dom";

const DEFAULT_COURSES = [
  {
    _id: "1",
    title: "Full Stack Web Development",
    description:
      "Master frontend and backend development using the MERN stack. Build real-world projects and become job-ready.",
    category: "Web Development",
    level: "beginner",
    price: 1999,
    thumbnail:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
    totalLectures: 120,
    totalDuration: 40,
    instructor: {
      name: "John Smith",
    },
  },
  {
    _id: "2",
    title: "Data Structures & Algorithms",
    description:
      "Learn DSA from scratch and crack coding interviews at top tech companies.",
    category: "Programming",
    level: "intermediate",
    price: 2499,
    thumbnail:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
    totalLectures: 90,
    totalDuration: 35,
    instructor: {
      name: "Sarah Johnson",
    },
  },
];

const CourseDetailsPage = () => {
  const { courseId } = useParams();

  const course = DEFAULT_COURSES.find(
    (c) => c._id === courseId
  );

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Course not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Left - Course Content */}
        <div className="lg:col-span-2">

          {/* Thumbnail */}
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-80 object-cover rounded-2xl mb-6"
          />

          {/* Title */}
          <h1 className="text-3xl font-semibold mb-2">
            {course.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
            <span className="capitalize">{course.level}</span>
            <span>{course.category}</span>
            <span>{course.totalLectures} lectures</span>
            <span>{course.totalDuration} hrs</span>
          </div>

          {/* Description */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-2">
              Course Description
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {course.description}
            </p>
          </div>
        </div>

        {/* Right - Sidebar */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 h-fit">

          <div className="mb-4">
            <span className="text-2xl font-semibold">
              ₹{course.price}
            </span>
          </div>

          <button
            className="w-full py-2.5 rounded-xl bg-black text-white font-medium
                       hover:bg-black/90 transition mb-4"
          >
            Enroll Now
          </button>

          <div className="border-t border-gray-200 pt-4 text-sm text-gray-600 space-y-2">
            <p>
              <span className="font-medium">Instructor:</span>{" "}
              {course.instructor.name}
            </p>
            <p>
              <span className="font-medium">Level:</span>{" "}
              {course.level}
            </p>
            <p>
              <span className="font-medium">Duration:</span>{" "}
              {course.totalDuration} hrs
            </p>
            <p>
              <span className="font-medium">Lectures:</span>{" "}
              {course.totalLectures}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CourseDetailsPage;
