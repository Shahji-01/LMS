import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const DEFAULT_STATUS = {
  purchased: "purchased", // other options: pending, failed
};

const CourseStatusPage = () => {
  const { courseId } = useParams();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API delay
    setTimeout(() => {
      setStatus(DEFAULT_STATUS.purchased);
      setLoading(false);
    }, 400);
  }, [courseId]);

  const statusStyles = {
    purchased: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    failed: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-md mx-auto">

        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-semibold">
            Course Purchase Status
          </h2>
          <p className="text-gray-600 mt-2">
            View your enrollment status for this course
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center">
          {loading ? (
            <p className="text-gray-600">Checking status...</p>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-3">
                Current Status
              </p>

              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                  statusStyles[status] || "bg-gray-100 text-gray-700"
                }`}
              >
                {status}
              </span>

              {/* Actions */}
              <div className="mt-6">
                {status === "purchased" && (
                  <Link
                    to={`/courses/${courseId}/progress`}
                    className="inline-block px-5 py-2.5 rounded-xl bg-black text-white font-medium
                               hover:bg-black/90 transition"
                  >
                    Start Learning
                  </Link>
                )}

                {status === "pending" && (
                  <p className="text-sm text-gray-600">
                    Your payment is being processed. Please check again later.
                  </p>
                )}

                {status === "failed" && (
                  <Link
                    to="/courses"
                    className="inline-block px-5 py-2.5 rounded-xl bg-black text-white font-medium
                               hover:bg-black/90 transition"
                  >
                    Try Again
                  </Link>
                )}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default CourseStatusPage;
