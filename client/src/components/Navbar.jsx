import React, { useState, useEffect } from "react";
import { Link, useLocation, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "../context/AuthContext";
import {
  Zap,
  Menu,
  X,
  ChevronDown,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationDropdown from "./NotificationDropdown";
import ROUTES from "../routes.jsx";

const NAV_LINKS = [
  { to: ROUTES.COURSES_PUBLISHED, label: "Curriculum" },
];

const Navbar = () => {
  const { user, isAuthenticated, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  const isDarkHero = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on navigation
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const getDashboardLink = () => {
    if (user?.role === "admin") return "/admin/dashboard";
    if (user?.role === "instructor") return "/instructor";
    return ROUTES.DASHBOARD;
  };

  // Navbar background logic
  const navBg = scrolled
    ? isDarkHero
      ? "bg-slate-900/95 backdrop-blur-xl border-b border-white/8 shadow-lg shadow-black/10"
      : "bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-sm"
    : isDarkHero
    ? "bg-transparent border-b border-transparent"
    : "bg-white/80 backdrop-blur-sm border-b border-slate-200/50";

  const textBase = isDarkHero && !scrolled
    ? "text-slate-300 hover:text-white"
    : "text-slate-600 hover:text-slate-900";

  const brandText = isDarkHero && !scrolled ? "text-white" : "text-slate-900";

  return (
    <>
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${navBg}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between gap-8">

          {/* ── Brand ── */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all group-hover:scale-105 ${
                isDarkHero && !scrolled
                  ? "bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/30"
                  : "bg-gradient-to-br from-blue-500 to-blue-600"
              }`}
            >
              <Zap size={15} className="text-white" strokeWidth={2.5} />
            </div>
            <span
              className={`text-[17px] font-bold font-heading tracking-tight transition-colors ${brandText}`}
            >
              LearnHub
            </span>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `text-sm font-semibold font-heading px-4 py-2 rounded-full transition-all ${
                    isActive
                      ? isDarkHero && !scrolled
                        ? "text-white bg-white/10"
                        : "text-blue-600 bg-blue-50"
                      : textBase
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* ── Desktop Right: Auth ── */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <NotificationDropdown />
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen((p) => !p)}
                    className={`flex items-center gap-2.5 px-2 py-1.5 rounded-full transition-all ${
                      isDarkHero && !scrolled
                        ? "hover:bg-white/10"
                        : "hover:bg-slate-100"
                    }`}
                  >
                    <img
                      src={
                        user?.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user?.name || "U"
                        )}&background=2563eb&color=fff&size=40`
                      }
                      alt={user?.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-white/20"
                    />
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${dropdownOpen ? "rotate-180" : ""} ${
                        isDarkHero && !scrolled ? "text-slate-300" : "text-slate-400"
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setDropdownOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -8 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden"
                        >
                          <div className="p-4 bg-gradient-to-b from-slate-50 to-white border-b border-slate-50">
                            <p className="text-sm font-bold text-slate-900 font-heading truncate">
                              {user?.name}
                            </p>
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {user?.email}
                            </p>
                          </div>
                          <div className="p-2 space-y-0.5">
                            {[
                              { to: getDashboardLink(), icon: LayoutDashboard, label: "Dashboard" },
                              { to: ROUTES.MY_COURSES, icon: BookOpen, label: "My Courses" },
                              { to: ROUTES.MY_PROFILE, icon: Settings, label: "Settings" },
                              ...(user?.role === "instructor"
                                ? [{ to: "/instructor", icon: GraduationCap, label: "Instructor" }]
                                : []),
                              ...(user?.role === "admin"
                                ? [{ to: "/admin/dashboard", icon: Shield, label: "Admin Panel" }]
                                : []),
                            ].map(({ to, icon: Icon, label }) => (
                              <Link
                                key={to}
                                to={to}
                                onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-colors font-medium"
                              >
                                <Icon size={15} strokeWidth={1.8} />
                                {label}
                              </Link>
                            ))}
                            <div className="border-t border-slate-50 pt-1 mt-1">
                              <button
                                onClick={() => { setDropdownOpen(false); signOut(); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
                              >
                                <LogOut size={15} strokeWidth={1.8} />
                                Sign Out
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className={`text-sm font-semibold font-heading transition-colors ${textBase}`}
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className={`text-sm font-semibold font-heading px-5 py-2.5 rounded-full transition-all ${
                    isDarkHero && !scrolled
                      ? "bg-white text-slate-900 hover:bg-slate-100 shadow-lg"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/25 hover:-translate-y-0.5"
                  }`}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile Hamburger ── */}
          <button
            onClick={() => setMobileOpen((p) => !p)}
            className={`md:hidden p-2 rounded-xl transition-colors ${
              isDarkHero && !scrolled
                ? "text-slate-300 hover:bg-white/10"
                : "text-slate-600 hover:bg-slate-100"
            }`}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* ── Mobile Menu ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className={`md:hidden border-t overflow-hidden ${
                isDarkHero && !scrolled
                  ? "bg-slate-900 border-white/8"
                  : "bg-white border-slate-100"
              }`}
            >
              <div className="px-6 py-5 space-y-4">
                {NAV_LINKS.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`block text-base font-semibold font-heading ${
                      isDarkHero && !scrolled ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {label}
                  </Link>
                ))}

                <div
                  className={`pt-4 border-t ${
                    isDarkHero && !scrolled ? "border-white/8" : "border-slate-100"
                  }`}
                >
                  {isAuthenticated ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            user?.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              user?.name || "U"
                            )}&background=2563eb&color=fff&size=80`
                          }
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className={`font-bold font-heading ${isDarkHero && !scrolled ? "text-white" : "text-slate-900"}`}>
                            {user?.name}
                          </p>
                          <p className={`text-xs ${isDarkHero && !scrolled ? "text-slate-400" : "text-slate-500"}`}>
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      <Link
                        to={getDashboardLink()}
                        className="block text-center py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold font-heading"
                      >
                        Go to Dashboard
                      </Link>
                      <button
                        onClick={signOut}
                        className={`block w-full text-center py-3 px-4 rounded-xl font-semibold font-heading text-red-600 ${
                          isDarkHero && !scrolled ? "bg-red-500/10" : "bg-red-50"
                        }`}
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link
                        to="/signin"
                        className={`block text-center py-3 px-4 rounded-xl font-semibold font-heading ${
                          isDarkHero && !scrolled
                            ? "bg-white/10 text-white"
                            : "bg-slate-100 text-slate-900"
                        }`}
                      >
                        Sign in
                      </Link>
                      <Link
                        to="/signup"
                        className="block text-center py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold font-heading shadow-md"
                      >
                        Get Started — Free
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
