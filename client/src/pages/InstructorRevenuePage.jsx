import React, { useState, useEffect } from "react";
import { getInstructorRevenue, requestPayout } from "../api/services/revenueService.js";
import toast from "react-hot-toast";
import { IndianRupee, RefreshCw, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const InstructorRevenuePage = () => {
    const [revenueData, setRevenueData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [amount, setAmount] = useState("");
    const [paymentEmail, setPaymentEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await getInstructorRevenue();
            setRevenueData(res.data || res);
        } catch {
            toast.error("Failed to load revenue data");
        } finally {
            setLoading(false);
        }
    };

    const handleRequest = async (e) => {
        e.preventDefault();
        const reqAmount = Number(amount);
        if (reqAmount < 100) return toast.error("Minimum payout is ₹100");
        if (reqAmount > revenueData.availableBalance) return toast.error("Exceeds available balance");

        setSubmitting(true);
        try {
            await requestPayout({ amount: reqAmount, paymentEmail });
            toast.success("Payout request submitted successfully!");
            setShowForm(false);
            setAmount("");
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to submit request.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-10 flex justify-center text-slate-500">Loading...</div>;

    const { grossRevenue, netRevenue, platformFeePct, availableBalance, totalWithdrawn, history } = revenueData;

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-heading font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <IndianRupee className="text-emerald-600" /> Revenue & Payouts
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Manage your earnings and request withdrawals straight to your account.</p>
                </div>
                <Link to="/instructor" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                    Back to Dashboard
                </Link>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
                <div className="card p-6 bg-slate-50 border-slate-200">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lifetime Gross Sales</p>
                    <p className="text-2xl font-black text-slate-800">₹{grossRevenue?.toLocaleString('en-IN') || 0}</p>
                </div>
                <div className="card p-6 bg-slate-50 border-slate-200">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Platform Fee ({platformFeePct}%)</p>
                    <p className="text-2xl font-black text-rose-500">-₹{(grossRevenue - netRevenue)?.toLocaleString('en-IN') || 0}</p>
                </div>
                <div className="card p-6 bg-slate-50 border-slate-200">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Your Net Total</p>
                    <p className="text-2xl font-black text-slate-800">₹{netRevenue?.toLocaleString('en-IN') || 0}</p>
                </div>
                <div className="card p-6 bg-emerald-50 border-emerald-200 shadow-lg shadow-emerald-500/10">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Available to Withdraw</p>
                    <p className="text-3xl font-black text-emerald-700">₹{availableBalance?.toLocaleString('en-IN') || 0}</p>
                </div>
            </div>

            {/* Payout Action */}
            <div className="mb-12">
                {!showForm ? (
                    <button 
                        onClick={() => setShowForm(true)} 
                        disabled={availableBalance < 100}
                        className="btn-primary bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-500 w-full sm:w-auto px-8"
                    >
                        Request Withdrawal
                    </button>
                ) : (
                    <div className="card p-8 border-emerald-100 bg-white shadow-xl max-w-2xl">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Request a Payout</h3>
                        <p className="text-sm text-slate-500 mb-6">Enter the amount you wish to withdraw and the email address associated with your PayPal or UPI account.</p>
                        <form onSubmit={handleRequest} className="space-y-4">
                            <div>
                                <label className="label">Amount (₹)</label>
                                <input 
                                    type="number" 
                                    min="100" 
                                    max={availableBalance}
                                    value={amount} 
                                    onChange={e => setAmount(e.target.value)} 
                                    className="input" 
                                    required 
                                />
                                <p className="text-xs text-slate-400 mt-1">Min: ₹100, Max: ₹{availableBalance?.toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                                <label className="label">Payment Email / UPI ID</label>
                                <input 
                                    type="text" 
                                    value={paymentEmail} 
                                    onChange={e => setPaymentEmail(e.target.value)} 
                                    className="input" 
                                    placeholder="e.g. instructor@paypal.com"
                                    required 
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="submit" disabled={submitting} className="btn-primary bg-emerald-600 hover:bg-emerald-700">
                                    {submitting ? "Submitting..." : "Submit Request"}
                                </button>
                                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                {availableBalance < 100 && !showForm && (
                     <p className="text-xs text-slate-400 mt-3 flex items-center gap-1"><Clock /> You need at least ₹100 to request a withdrawal.</p>
                )}
            </div>

            {/* History */}
            <div>
                <h3 className="text-xl font-bold text-slate-900 mb-6">Withdrawal History</h3>
                <div className="card overflow-hidden border-slate-200">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 uppercase text-xs font-bold text-slate-500 tracking-wider">
                                <th className="p-4 indent-2">Date</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4 hidden sm:table-cell">Account</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {history?.map(req => (
                                <tr key={req._id}>
                                    <td className="p-4 indent-2 font-medium text-slate-700">
                                        {new Date(req.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 font-bold text-slate-900">₹{req.amount.toLocaleString('en-IN')}</td>
                                    <td className="p-4 hidden sm:table-cell text-sm text-slate-500">{req.paymentEmail}</td>
                                    <td className="p-4">
                                        {req.status === 'paid' && <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-full"><CheckCircle /> PAID</span>}
                                        {req.status === 'pending' && <span className="inline-flex items-center gap-1 text-orange-500 font-bold text-xs bg-orange-50 px-2.5 py-1 rounded-full"><RefreshCw className="animate-spin-slow" /> PENDING</span>}
                                        {req.status === 'rejected' && <span className="inline-flex items-center gap-1 text-red-500 font-bold text-xs bg-red-50 px-2.5 py-1 rounded-full">REJECTED</span>}
                                    </td>
                                </tr>
                            ))}
                            {history?.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500">No withdrawal history found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InstructorRevenuePage;
