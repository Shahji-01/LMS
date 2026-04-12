import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Search, ChevronRight, Trash2, AlertCircle, ShieldAlert, GraduationCap, Briefcase } from "lucide-react";
import axiosInstance from "../api/axios.js";
import toast from "react-hot-toast";

const ROLES = ["student", "instructor", "admin"];

const ManageUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [cursor, setCursor] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [updating, setUpdating] = useState(null);

    const fetchUsers = async (reset = true) => {
        try {
            setLoading(true);
            const params = { limit: 20 };
            if (roleFilter) params.role = roleFilter;
            if (!reset && cursor) params.cursor = cursor;

            const res = await axiosInstance.get("/admin/users", { params });
            const { data, nextCursor } = res.data.data;

            setUsers(reset ? data : (prev) => [...prev, ...data]);
            setCursor(nextCursor || null);
            setHasMore(!!nextCursor);
        } catch (err) {
            toast.error(err.response?.data?.error?.message || "Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(true); }, [roleFilter]);

    const handleRoleChange = async (userId, newRole) => {
        setUpdating(userId);
        try {
            await axiosInstance.patch(`/admin/users/${userId}/role`, { role: newRole });
            setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, role: newRole } : u));
            toast.success(`Role updated to ${newRole}`);
        } catch (err) {
            toast.error(err.response?.data?.error?.message || "Failed to update role");
        } finally {
            setUpdating(null);
        }
    };

    const handleDelete = async (userId) => {
        if (!confirm("Deactivate this user?")) return;
        try {
            await axiosInstance.delete(`/admin/users/${userId}`);
            setUsers((prev) => prev.filter((u) => u._id !== userId));
            toast.success("User deactivated");
        } catch (err) {
            toast.error("Failed to deactivate user");
        }
    };

    const filtered = users.filter(
        (u) =>
            !search ||
            u.name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase())
    );

    const getRoleStyles = (role) => {
        switch (role) {
            case 'admin':
                return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: <ShieldAlert size={14} className="text-rose-500" /> };
            case 'instructor':
                return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: <Briefcase size={14} className="text-indigo-500" /> };
            default:
                return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', icon: <GraduationCap size={14} className="text-slate-500" /> };
        }
    };

    return (
        <div className="p-6 sm:p-8 min-h-[80vh]">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                        <Users size={20} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-2xl font-heading font-black text-slate-900 tracking-tight">User Management</h1>
                </div>
                <p className="text-slate-500 text-sm font-medium ml-14">View, filter, and manage platform user roles.</p>
            </motion.div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1 max-w-md">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full pl-11 pr-4 h-12 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all shadow-sm"
                    />
                </div>
                <div className="relative">
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="h-12 bg-white border border-slate-200 rounded-xl pl-4 pr-10 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all shadow-sm appearance-none min-w-[160px]"
                    >
                        <option value="">All Roles</option>
                        {ROLES.map((r) => <option key={r} value={r} className="capitalize">{r}</option>)}
                    </select>
                    <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                            <tr>
                                <th className="px-6 py-4 rounded-tl-3xl">User Profile</th>
                                <th className="px-6 py-4">Account Role</th>
                                <th className="px-6 py-4">Joined Date</th>
                                <th className="px-6 py-4 text-right rounded-tr-3xl">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading && !users.length
                                ? [...Array(5)].map((_, i) => (
                                    <tr key={i}><td colSpan={4} className="px-6 py-5"><div className="h-5 bg-slate-100 rounded-md animate-pulse w-full max-w-sm" /></td></tr>
                                ))
                                : filtered.map((u) => {
                                    const roleStyle = getRoleStyles(u.role);
                                    return (
                                        <motion.tr
                                            key={u._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-slate-50/50 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <img
                                                        src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=eff6ff&color=2563eb`}
                                                        alt={u.name}
                                                        className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                                                    />
                                                    <div>
                                                        <p className="font-bold text-slate-900">{u.name}</p>
                                                        <p className="text-xs text-slate-500 font-medium">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-widest ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}>
                                                        {roleStyle.icon}
                                                        <select
                                                            value={u.role}
                                                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                                            disabled={updating === u._id}
                                                            className="bg-transparent border-none p-0 cursor-pointer focus:ring-0 appearance-none font-bold uppercase tracking-widest text-inherit"
                                                        >
                                                            {ROLES.map((r) => <option key={r} value={r} className="text-slate-900 normal-case tracking-normal">{r}</option>)}
                                                        </select>
                                                    </div>
                                                    {updating === u._id && <div className="w-4 h-4 rounded-full border-2 border-slate-200 border-t-blue-600 animate-spin" />}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                                                {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(u._id)}
                                                    className="w-9 h-9 rounded-xl inline-flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                    title="Deactivate Account"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>

                {!loading && !filtered.length && (
                    <div className="py-16 text-center">
                        <AlertCircle size={40} className="text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900">No Users Found</h3>
                        <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters.</p>
                    </div>
                )}

                {hasMore && (
                    <div className="p-4 border-t border-slate-100 flex justify-center bg-slate-50/50">
                        <button
                            onClick={() => fetchUsers(false)}
                            className="h-10 px-4 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
                        >
                            Load More Results <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageUsersPage;
