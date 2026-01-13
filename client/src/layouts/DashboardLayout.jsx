import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import SideBar_Dashborad from "../components/SideBar_Dashborad";

const DashboardLayout = () => {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (FIXED / NON-SCROLLING) */}
        <SideBar_Dashborad />

        {/* MAIN CONTENT (SCROLLS) */}
        <main className="flex-1 overflow-y-auto px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
