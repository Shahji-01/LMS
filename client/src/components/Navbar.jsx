import React from "react";
import { Link } from "react-router-dom";
import ROUTES from "../../routes";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, signOut } = useAuth();

return (
    <nav className="w-full h-16 px-6 flex items-center border-b border-gray-200 bg-white">

      {/* Left - Brand */}
      <div className="flex-1 flex items-center gap-6">
        <Link
          to={ROUTES.HOME}
          className="text-xl font-semibold tracking-tight"
        >
          BrainOS
        </Link>

        {/* Left Links (optional) */}
        <div className="hidden md:flex items-center gap-4 text-sm font-medium text-gray-600">
          <Link
            to={ROUTES.HOME}
            className="hover:text-black transition"
          >
            Home
          </Link>
          <Link
            to={ROUTES.COURSES_PUBLISHED}
            className="hover:text-black transition"
          >
            Courses
          </Link>
        </div>
      </div>

      {/* Center - Search */}
      <div className="flex-1 flex justify-center">
        <input
          type="text"
          placeholder="Search..."
          className="w-full max-w-md rounded-xl border border-gray-300 px-4 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-black/80"
        />
      </div>

      {/* Right - Auth / User */}
      <div className="flex-1 flex justify-end items-center gap-4 text-sm font-medium">

        {user ? (
          <>
            <Link
              to={ROUTES.DASHBOARD}
              className="hover:text-black transition"
            >
              Dashboard
            </Link>

            <button
              onClick={signOut}
              className="px-3 py-1.5 rounded-lg border border-gray-300
                         hover:bg-gray-100 transition"
            >
              Logout
            </button>

            {/* Profile Avatar */}
            <img
              src={user?.avatar || "https://i.pravatar.cc/40"}
              alt="Profile"
              className="w-9 h-9 rounded-full cursor-pointer border"
            />
          </>
        ) : (
          <>
            <Link
              to={ROUTES.SIGNIN}
              className="hover:text-black transition"
            >
              Sign In
            </Link>
            <Link
              to={ROUTES.SIGNUP}
              className="px-4 py-1.5 rounded-lg bg-black text-white
                         hover:bg-black/90 transition"
            >
              Sign Up
            </Link>
          </>
        )}

      </div>
    </nav>
);
};

export default Navbar;
