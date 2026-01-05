import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const DEFAULT_LECTURES = [
  {
    _id: "1",
    title: "Introduction to the Course",
    description: "Overview of what you will learn in this course",
    duration: 10,
    status: "published",
  },
  {
    _id: "2",
    title: "Project Setup & Tooling",
    description: "Setting up the development environment",
    duration: 15,
    status: "published",
  },
  {
    _id: "3",
    title: "Core Concepts Explained",
    description: "Deep dive into important fundamentals",
    duration: 20,
    status: "draft",
  },
];

const ManageLecturesPage = () => {
  const { courseId } = useParams();
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API delay
    setTimeout(() => {
      setLectures(DEFAULT_LECTURES);
      setLoading(false);
    }, 400);
  }, [courseId]);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10">
          <div>
            <h2 className="text-3xl font-semibold">
              Manage Lectures
            </h2>
            <p className="text-gray-600 mt-2">
              Add, view, and organize your course lectures
            </p>
          </div>

          <Link
            to={`/dashboard/courses/${courseId}/lectures/add`}
            className="mt-4 sm:mt-0 inline-flex items-center px-5 py-2.5
                       rounded-xl bg-black text-white font-medium
                       hover:bg-black/90 transition"
          >
            + Add Lecture
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <p className="text-gray-600">Loading lectures...</p>
        ) : lectures.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <p className="text-gray-600 mb-4">
              No lectures added yet.
            </p>
            <Link
              to={`/dashboard/courses/${courseId}/lectures/add`}
              className="inline-block px-5 py-2.5 rounded-xl bg-black text-white font-medium
                         hover:bg-black/90 transition"
            >
              Add your first lecture
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {lectures.map((lec, index) => (
                <li
                  key={lec._id}
                  className="flex items-center justify-between p-5"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                      {index + 1}.
                    </span>
                    <div>
                      <p className="font-medium">
                        {lec.title}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {lec.description}
                      </p>
                    </div>
                  </div>

                  {/* Status + Actions */}
                  <div className="flex items-center gap-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        lec.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {lec.status}
                    </span>

                    <Link
                      to={`/dashboard/courses/${courseId}/lectures/${lec._id}/edit`}
                      className="text-gray-600 hover:text-black"
                    >
                      Edit
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
};

export default ManageLecturesPage;
