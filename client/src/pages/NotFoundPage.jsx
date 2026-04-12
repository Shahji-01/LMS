import React from "react";
import { Link } from "react-router-dom";
import { Home, Frown } from "lucide-react";

const NotFoundPage = () => (
  <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
    <div className="space-y-6 max-w-md fade-in-up">
      <div className="text-8xl font-black gradient-text">404</div>
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto">
        <Frown className="w-8 h-8 text-indigo-400" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-500">The page you're looking for doesn't exist or has been moved.</p>
      </div>
      <Link to="/" className="btn-primary inline-flex">
        <Home className="w-4 h-4" />
        Back to Home
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
