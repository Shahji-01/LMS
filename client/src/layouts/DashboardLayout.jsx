import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { logoutUser } from "../Store/Reducers/authSlice.jsx";
import {
  LayoutDashboard,
  BookOpen,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  Shield,
  GraduationCap,
  Heart,
  ShoppingBag,
  PlusCircle,
  Settings,
  Users,
  Tag,
  Ticket,
  TrendingUp,
  DollarSign,
  FileText,
  Bell,
  Search,
  Zap,
} from "lucide-react";
import NotificationDropdown from "../components/NotificationDropdown.jsx";
import ROUTES from "../routes.jsx";

/* ── Nav Section definition ──────────────────────────────────────────────── */
const buildNav = (user) => {
  const isInstructor = user?.role === "instructor" || user?.role === "admin";
  const isAdmin = user?.role === "admin";

  const sections = [
    {
      label: "Learning",
      links: [
        { to: ROUTES.DASHBOARD, icon: LayoutDashboard, label: "Overview" },
        { to: ROUTES.MY_COURSES, icon: BookOpen, label: "My Courses" },
        { to: ROUTES.WISHLIST, icon: Heart, label: "Wishlist" },
        { to: ROUTES.PURCHASES, icon: ShoppingBag, label: "Purchases" },
      ],
    },
  ];

  if (isInstructor) {
    sections.push({
      label: "Instructor",
      links: [
        { to: "/instructor", icon: GraduationCap, label: "Dashboard" },
        { to: "/instructor/create-course", icon: PlusCircle, label: "Create Course" },
        { to: "/instructor/analytics", icon: BarChart2, label: "Analytics" },
        { to: "/instructor/revenue", icon: DollarSign, label: "Revenue" },
      ],
    });
  }

  if (isAdmin) {
    sections.push({
      label: "Admin",
      links: [
        { to: "/admin/dashboard", icon: Shield, label: "Dashboard" },
        { to: "/admin/users", icon: Users, label: "Users" },
        { to: "/admin/courses", icon: FileText, label: "Courses" },
        { to: "/admin/categories", icon: Tag, label: "Categories" },
        { to: "/admin/coupons", icon: Ticket, label: "Coupons" },
        { to: "/admin/analytics", icon: TrendingUp, label: "Analytics" },
      ],
    });
  }

  sections.push({
    label: "Account",
    links: [
      { to: ROUTES.MY_PROFILE, icon: User, label: "Profile" },
      { to: ROUTES.CHANGE_PASSWORD, icon: Settings, label: "Security" },
    ],
  });

  return sections;
};

/* ── Sidebar Nav Link ─────────────────────────────────────────────────────── */
const SidebarLink = ({ to, icon: Icon, label, collapsed }) => (
  <NavLink
    to={to}
    end
    title={collapsed ? label : undefined}
  >
    {({ isActive }) => (
      <span className={`sidebar-link ${isActive ? "active" : ""}`}>
        <Icon size={17} className="shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              className="whitespace-nowrap overflow-hidden text-sm"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    )}
  </NavLink>
);

/* ── Top Bar ──────────────────────────────────────────────────────────────── */
const TopBar = ({ user, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20 shrink-0">
      {/* Left: brand on mobile */}
      <div className="flex items-center gap-3">
        <div className="md:hidden flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center">
            <Zap size={14} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-slate-900 font-heading">LearnHub</span>
        </div>
      </div>

      {/* Right: notifications + avatar */}
      <div className="flex items-center gap-2 ml-auto">
        <NotificationDropdown />

        {/* Avatar dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((p) => !p)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <img
              src={
                user?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.name || "U"
                )}&background=2563eb&color=fff&size=40`
              }
              alt={user?.name}
              className="w-7 h-7 rounded-full object-cover ring-2 ring-slate-200"
            />
            <span className="hidden sm:block text-sm font-semibold text-slate-700 font-heading max-w-[120px] truncate">
              {user?.name?.split(" ")[0]}
            </span>
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
                  className="absolute right-0 mt-1 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-slate-50 bg-gradient-to-b from-slate-50 to-white">
                    <p className="text-sm font-bold text-slate-900 font-heading truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {user?.email}
                    </p>
                  </div>
                  <div className="p-2 space-y-0.5">
                    <Link
                      to="/dashboard/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-colors"
                    >
                      <User size={15} />
                      Profile Settings
                    </Link>
                    <Link
                      to="/dashboard/change-password"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-colors"
                    >
                      <Settings size={15} />
                      Security
                    </Link>
                    <div className="border-t border-slate-50 pt-1 mt-1">
                      <button
                        onClick={() => { setDropdownOpen(false); onLogout(); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <LogOut size={15} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

/* ── Main Layout ──────────────────────────────────────────────────────────── */
const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const navSections = buildNav(user);

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/signin");
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-4 border-b shrink-0"
        style={{ borderColor: "var(--sidebar-border)" }}
      >
        <Link to="/" className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity">
          <Zap size={16} className="text-white" strokeWidth={2.5} />
        </Link>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <span className="text-white font-bold font-heading text-sm whitespace-nowrap">
                LearnHub
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Sections */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll py-3 px-2 space-y-5">
        {navSections.map((section) => (
          <div key={section.label}>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="sidebar-section-label mb-2"
                >
                  {section.label}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-0.5">
              {section.links.map(({ to, icon, label }) => (
                <SidebarLink
                  key={to}
                  to={to}
                  icon={icon}
                  label={label}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div
        className="p-2 border-t shrink-0"
        style={{ borderColor: "var(--sidebar-border)" }}
      >
        {/* User info */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-3 px-3 py-2.5 mb-1 overflow-hidden"
            >
              <img
                src={
                  user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user?.name || "U"
                  )}&background=2563eb&color=fff&size=40`
                }
                alt=""
                className="w-8 h-8 rounded-full object-cover ring-2 shrink-0"
                style={{ ringColor: "var(--sidebar-border)" }}
              />
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold font-heading truncate leading-tight">
                  {user?.name}
                </p>
                <p
                  className="text-xs truncate"
                  style={{ color: "var(--sidebar-text)" }}
                >
                  {user?.role}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleLogout}
          className="sidebar-link w-full hover:!text-rose-400 hover:!bg-rose-500/10"
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut size={17} className="shrink-0" />
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18 }}
                className="whitespace-nowrap overflow-hidden text-sm"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* ── Desktop Sidebar ──────────────────────────────────────────────── */}
      <motion.aside
        animate={{ width: collapsed ? 68 : 240 }}
        transition={{ duration: 0.22, ease: "easeInOut" }}
        className="hidden md:flex flex-col relative shrink-0 overflow-hidden"
        style={{ background: "var(--bg-sidebar)", borderRight: "1px solid var(--sidebar-border)" }}
      >
        {sidebarContent}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((p) => !p)}
          className="absolute top-[52px] -right-3.5 w-7 h-7 bg-slate-700 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-lg transition-colors z-10 border border-slate-600"
        >
          {collapsed ? (
            <ChevronRight size={13} className="text-white" />
          ) : (
            <ChevronLeft size={13} className="text-white" />
          )}
        </button>
      </motion.aside>

      {/* ── Mobile Sidebar Overlay ────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="md:hidden fixed inset-y-0 left-0 w-64 z-50 flex flex-col overflow-hidden"
              style={{ background: "var(--bg-sidebar)" }}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content Area ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar user={user} onLogout={handleLogout} mobileMenuOpen={mobileOpen} onMobileMenuToggle={() => setMobileOpen(p => !p)} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
