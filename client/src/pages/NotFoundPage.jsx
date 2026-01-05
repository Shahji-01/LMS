import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md text-center bg-white border border-gray-200 rounded-2xl shadow-sm p-8">

        {/* Title */}
        <h2 className="text-5xl font-bold text-black mb-4">
          404
        </h2>

        {/* Message */}
        <p className="text-lg font-medium mb-2">
          Page not found
        </p>
        <p className="text-sm text-gray-600 mb-6">
          The page you are looking for doesn’t exist or has been moved.
        </p>

        {/* Action */}
        <Link
          to="/"
          className="inline-block px-6 py-2.5 rounded-xl bg-black text-white font-medium
                     hover:bg-black/90 transition"
        >
          Go back home
        </Link>

      </div>
    </div>
  );
};

export default NotFoundPage;
