import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import * as authService from "../api/services/authService.js";
import toast from "react-hot-toast";
import { BookOpen, Eye, EyeOff, ShieldCheck } from "lucide-react";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    let toastId = toast.loading("Resetting password...");
    try {
      await authService.resetPassword(token, password);
      toast.success("Password reset successfully! You can now log in.", { id: toastId });
      navigate("/signin");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Reset failed. The link may have expired.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — Illustration */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-indigo-600 to-purple-700 p-12 text-white">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold">LearnHub</span>
        </Link>
        <div className="space-y-4 max-w-lg">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6 backdrop-blur-md border border-white/20 shadow-xl">
            <ShieldCheck className="w-8 h-8 text-indigo-100" />
          </div>
          <h2 className="text-4xl font-bold leading-tight">
            Secure your<br />account
          </h2>
          <p className="text-indigo-200 text-lg">
            Choose a new, strong password to regain access to your dashboard and purchased courses.
          </p>
        </div>
        <p className="text-indigo-200 text-sm">© {new Date().getFullYear()} LearnHub. All rights reserved.</p>
      </div>

      {/* Right — Form */}
      <div className="flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 lg:hidden w-fit">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">LearnHub</span>
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
            <p className="text-gray-500 mt-1 text-sm">Enter a new password for your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">New password</label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Must be at least 8 characters.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 h-12 shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Resetting...
                </div>
              ) : "Reset Password"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            Remembered your password?{" "}
            <Link to="/signin" className="text-indigo-600 font-medium hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
