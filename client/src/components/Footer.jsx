import React from "react";
import { Link } from "react-router-dom";
import ROUTES from "../../routes";
const Footer = () => {
  return (
    <footer className="w-full border-t border-gray-200 bg-white mt-20">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <h2 className="text-xl font-semibold">BrainOS</h2>
          <p className="mt-3 text-sm text-gray-600 max-w-xs">
            Your personal operating system to organize tasks, goals, knowledge,
            and life — all in one place.
          </p>
        </div>

        {/* Product */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
            Product
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>
              <Link to={ROUTES.HOME} className="hover:text-black">
                Home
              </Link>
            </li>
            <li>
              <Link to={ROUTES.COURSES_PUBLISHED} className="hover:text-black">
                Courses
              </Link>
            </li>
            <li>
              <Link to={ROUTES.DASHBOARD} className="hover:text-black">
                Dashboard
              </Link>
            </li>
          </ul>
        </div>

        {/* Account */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
            Account
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>
              <Link to={ROUTES.SIGNIN} className="hover:text-black">
                Sign In
              </Link>
            </li>
            <li>
              <Link to={ROUTES.SIGNUP} className="hover:text-black">
                Sign Up
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
            Legal
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>
              <Link to="/privacy" className="hover:text-black">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-black">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} BrainOS. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-gray-500">
            <a href="#" className="hover:text-black">
              Twitter
            </a>
            <a href="#" className="hover:text-black">
              GitHub
            </a>
            <a href="#" className="hover:text-black">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
