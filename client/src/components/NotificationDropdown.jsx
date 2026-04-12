import React, { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { getMyNotifications, markAsRead, markAllAsRead } from "../api/services/notificationService";
import { motion, AnimatePresence } from "framer-motion";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await getMyNotifications();
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {
      /* silent */
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleRead = async (id, hasLink) => {
    try {
      await markAsRead(id);
      setNotifications((n) => n.map((x) => (x._id === id ? { ...x, isRead: true } : x)));
      setUnreadCount((c) => Math.max(0, c - 1));
      if (!hasLink) setIsOpen(false);
    } catch { /* silent */ }
  };

  const handleReadAll = async () => {
    try {
      await markAllAsRead();
      setNotifications((n) => n.map((x) => ({ ...x, isRead: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
  };

  return (
    <div className="relative z-50" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="relative w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} strokeWidth={1.8} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-80 md:w-96 bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-2">
                <h3 className="font-bold font-heading text-slate-900 text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold font-heading">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleReadAll}
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <CheckCheck size={13} />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[70vh] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell size={28} className="text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-sm font-medium text-slate-400">No notifications yet</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-50">
                  {notifications.map((n) => {
                    const inner = (
                      <div className="flex gap-3 p-4">
                        {!n.isRead && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        )}
                        <div className={!n.isRead ? "" : "ml-5"}>
                          <p className={`text-sm leading-snug ${!n.isRead ? "font-bold text-slate-900" : "font-medium text-slate-600"}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                            {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                      </div>
                    );
                    return (
                      <li
                        key={n._id}
                        className={`transition-colors hover:bg-slate-50 cursor-pointer ${!n.isRead ? "bg-blue-50/30" : ""}`}
                      >
                        {n.link ? (
                          <Link to={n.link} onClick={() => handleRead(n._id, true)}>{inner}</Link>
                        ) : (
                          <div onClick={() => handleRead(n._id, false)}>{inner}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
