import React, { useState, useEffect } from "react";
import { getCoupons, createCoupon, toggleCouponStatus, deleteCoupon } from "../api/services/couponService";
import toast from "react-hot-toast";
import { Plus, Trash2, Ticket } from "lucide-react";

const ManageCouponsPage = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ code: "", discountPercentage: 10, expirationDate: "", maxUses: 100 });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await getCoupons();
            setCoupons(res.data || res);
        } catch {
            toast.error("Failed to load coupons");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenForm = () => {
        setFormData({ code: "", discountPercentage: 10, expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], maxUses: 100 });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.code.trim()) return toast.error("Code is required");

        setSubmitting(true);
        try {
            await createCoupon(formData);
            toast.success("Coupon created");
            setShowForm(false);
            fetchCoupons();
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || "Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            await toggleCouponStatus(id, !currentStatus);
            toast.success("Status updated");
            fetchCoupons();
        } catch {
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This will permanently delete the coupon.")) return;
        try {
            await deleteCoupon(id);
            toast.success("Coupon deleted");
            fetchCoupons();
        } catch {
            toast.error("Failed to delete.");
        }
    };

    if (loading) return <div className="p-10 flex justify-center text-slate-500">Loading...</div>;

    return (
        <div className="max-w-5xl mx-auto p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Ticket className="text-emerald-600" /> Manage Coupons
                    </h1>
                    <p className="text-slate-500 font-medium tracking-wide mt-2">Create global discount codes for marketing campaigns</p>
                </div>
                {!showForm && (
                    <button onClick={handleOpenForm} className="btn-primary bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 gap-2">
                        <Plus className="w-5 h-5" /> Create Coupon
                    </button>
                )}
            </div>

            {showForm && (
                <div className="card p-8 mb-10 border-emerald-100 bg-emerald-50/30">
                    <h2 className="text-xl font-bold mb-6 text-slate-800">New Promotion Code</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="label">Coupon Code (Uppercase) *</label>
                                <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="input uppercase font-mono" placeholder="e.g. SUMMER2026" required maxLength={20} />
                            </div>
                            <div>
                                <label className="label">Discount Percentage (%) *</label>
                                <input type="number" min="1" max="100" value={formData.discountPercentage} onChange={e => setFormData({...formData, discountPercentage: e.target.value})} className="input" required />
                            </div>
                            <div>
                                <label className="label">Expiration Date *</label>
                                <input type="date" value={formData.expirationDate} onChange={e => setFormData({...formData, expirationDate: e.target.value})} className="input" required />
                            </div>
                            <div>
                                <label className="label">Maximum Total Uses (0 = unlimited)</label>
                                <input type="number" min="0" value={formData.maxUses} onChange={e => setFormData({...formData, maxUses: e.target.value})} className="input" required />
                            </div>
                        </div>
                        
                        <div className="flex gap-4 pt-4 border-t border-emerald-100">
                            <button type="submit" disabled={submitting} className="btn-primary bg-emerald-600 hover:bg-emerald-700 w-32 h-11">
                                {submitting ? "Saving..." : "Create"}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary w-32 h-11">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card overflow-hidden border-slate-200">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 uppercase text-xs font-bold text-slate-500 tracking-wider">
                            <th className="p-4 indent-2">Code</th>
                            <th className="p-4">Discount</th>
                            <th className="p-4">Validity</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {coupons.map(coupon => {
                            const isExpired = new Date(coupon.expirationDate) < new Date();
                            const isExhausted = coupon.maxUses > 0 && coupon.currentUses >= coupon.maxUses;
                            const isUsable = coupon.isActive && !isExpired && !isExhausted;

                            return (
                                <tr key={coupon._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 indent-2 font-mono font-bold text-emerald-700">{coupon.code}</td>
                                    <td className="p-4 font-bold text-slate-800">{coupon.discountPercentage}% OFF</td>
                                    <td className="p-4 text-sm text-slate-600">
                                        <div className="flex flex-col gap-1">
                                            <span className={isExpired ? "text-red-500 font-medium" : ""}>Exp: {new Date(coupon.expirationDate).toLocaleDateString()}</span>
                                            <span className={isExhausted ? "text-orange-500 font-medium" : "text-slate-400"}>Uses: {coupon.currentUses} / {coupon.maxUses === 0 ? "∞" : coupon.maxUses}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button 
                                            onClick={() => handleToggleStatus(coupon._id, coupon.isActive)}
                                            className={`px-3 py-1 rounded-full text-xs font-bold ${coupon.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                                        >
                                            {coupon.isActive ? "ACTIVE" : "DISABLED"}
                                        </button>
                                        {(!isUsable && coupon.isActive) && <div className="text-[10px] text-red-500 mt-1 font-bold">UNUSABLE</div>}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => handleDelete(coupon._id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {coupons.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">
                                    No coupons found. Create your first promotion!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageCouponsPage;
