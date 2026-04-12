import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const PERKS = [
  "45,000+ active learners",
  "Expert-led, production-grade courses",
  "Certificate on completion",
  "Lifetime access to all materials",
];

const SignInPage = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error("Please fill all fields.");
    setLoading(true);
    try {
      const user = await signIn({ email: form.email, password: form.password });
      toast.success(`Welcome back, ${user?.name?.split(" ")[0] || ""}!`);
      navigate(
        user?.role === "admin"
          ? "/admin/dashboard"
          : user?.role === "instructor"
          ? "/instructor"
          : "/dashboard"
      );
    } catch (err) {
      const backendError = err?.response?.data?.error;
      const errorMessage =
        backendError?.fields?.[0]?.message ||
        backendError?.message ||
        err?.response?.data?.message ||
        "Invalid email or password.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left Panel ───────────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[44%] p-12 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}
      >
        {/* Orbs */}
        <div className="absolute -top-20 -left-20 w-80 h-80 orb orb-blue opacity-50" />
        <div className="absolute bottom-10 right-0 w-72 h-72 orb orb-purple opacity-40" />
        <div className="absolute inset-0 dot-grid opacity-[0.04]" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <Zap size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold font-heading">LearnHub</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-4xl font-black font-heading leading-tight mb-3 tracking-tight">
              Continue your<br />
              <span className="text-gradient-brand">learning journey</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Sign in to pick up right where you left off.
            </p>
          </div>
          <ul className="space-y-3">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 size={17} className="text-emerald-400 shrink-0" strokeWidth={2} />
                <span className="text-sm font-medium">{perk}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-slate-600 text-sm relative z-10">
          © {new Date().getFullYear()} LearnHub. All rights reserved.
        </p>
      </div>

      {/* ── Right Panel ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2.5 lg:hidden mb-8">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Zap size={14} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold font-heading text-slate-900">LearnHub</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-black font-heading text-slate-900 tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-slate-500">
              Sign in to your account to continue learning.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="input-group">
              <label htmlFor="email" className="label">Email address</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
                required
              />
            </div>

            <div className="input-group">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="label">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  className="input pr-11"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin-smooth" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SignInPage;
