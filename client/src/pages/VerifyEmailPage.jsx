import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, GraduationCap } from "lucide-react";
import axiosInstance from "../api/axios.js";

const VerifyEmailPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const initialEmail = location.state?.email || "";
    const [email, setEmail] = useState(initialEmail);
    const [otp, setOtp] = useState("");
    
    const [status, setStatus] = useState("idle"); // idle | loading | success | error
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !otp) return;
        
        setStatus("loading");
        try {
            const res = await axiosInstance.post(`/user/verify-email`, { email, otp });
            setStatus("success");
            setMessage(res.data?.message || "Email verified successfully!");
            
            // Re-fetch user profile so Redux state is updated with isEmailVerified: true
            const { fetchCurrentUser } = await import("../Store/Reducers/authSlice.jsx");
            const store = (await import("../Store/store.jsx")).default;
            await store.dispatch(fetchCurrentUser());

            setTimeout(() => navigate("/dashboard"), 3000);
        } catch (err) {
            setStatus("error");
            setMessage(err.response?.data?.error?.message || "Verification failed. Invalid or expired OTP.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-10 max-w-md w-full text-center shadow-xl"
            >
                {/* Logo */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
                    <GraduationCap size={28} className="text-white" />
                </div>

                {status === "idle" || status === "loading" || status === "error" ? (
                    <>
                        <h1 className="text-white text-2xl font-semibold mb-2">Verify your email</h1>
                        <p className="text-gray-400 text-sm mb-6">Enter the 6-digit OTP sent to your email.</p>
                        
                        {status === "error" && (
                            <div className="mb-4 text-sm text-red-500 bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4 text-left">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">6-Digit Code</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-center tracking-[0.5em] font-mono text-lg"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    placeholder="------"
                                />
                            </div>
                            
                            <button
                                type="submit"
                                disabled={status === "loading" || otp.length !== 6 || !email}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors mt-2"
                            >
                                {status === "loading" ? "Verifying..." : "Verify OTP"}
                            </button>
                        </form>
                        
                        <div className="mt-6">
                            <Link to="/signin" className="text-sm text-indigo-400 hover:text-indigo-300">
                                Back to sign in
                            </Link>
                        </div>
                    </>
                ) : (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="mb-4"
                        >
                            <CheckCircle size={48} className="text-emerald-400 mx-auto" />
                        </motion.div>
                        <h1 className="text-white text-xl font-semibold mb-2">Email Verified!</h1>
                        <p className="text-gray-400 text-sm mb-6">{message}</p>
                        <p className="text-gray-500 text-xs">Unlocking your dashboard…</p>
                        <div className="mt-4 h-1 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 3, ease: "linear" }}
                                className="h-full bg-emerald-500 rounded-full"
                            />
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default VerifyEmailPage;
