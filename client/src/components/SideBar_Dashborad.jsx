import React from "react";
import { Links, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SideBar_Dashborad = () => {
  const { user } = useAuth();

  const studentLinks = [
    { to: "/dashboard", label: "Overview" },
    { to: "/dashboard/my-courses", label: "My Courses" },
    { to: "/dashboard/profile", label: "Profile" },
    { to: "/dashboard/change-password", label: "Change Password" },
  ];

  const instructorLinks = [
    { to: "/dashboard", label: "Overview" },
    { to: "/dashboard/courses", label: "My Courses" },
    { to: "/dashboard/profile", label: "Profile" },
    { to: "/dashboard/change-password", label: "Change Password" },
  ];

  const links = user?.role === "instructor" ? instructorLinks : studentLinks;
  return (
    <aside className="w-64 bg-white border-r border-gray-200 px-4 py-6">
      <p className="text-xs font-semibold text-gray-500 uppercase mb-4">
        Dashboard
      </p>

      <nav className="space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end
            className={({ isActive }) =>
              `block rounded-lg px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-black text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default SideBar_Dashborad;
