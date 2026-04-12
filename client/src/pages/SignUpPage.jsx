import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const STEPS = [
  "Access 120+ expert-led courses",
  "Track your progress effortlessly",
  "Earn verified certificates",
  "Join 45,000+ ambitious learners",
];

const SignUpPage = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return { level: 0, label: "", color: "" };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { level: 1, label: "Weak", color: "bg-red-500" };
    if (score <= 2) return { level: 2, label: "Fair", color: "bg-orange-500" };
    if (score <= 3) return { level: 3, label: "Good", color: "bg-yellow-500" };
    return { level: 4, label: "Strong", color: "bg-emerald-500" };
  };

  const strength = passwordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password validation matching backend requirements
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/;
    if (form.password.length < 8) {
      return toast.error("Password must be at least 8 characters long.");
    }
    if (!passwordRegex.test(form.password)) {
      return toast.error(
        "Password must contain at least one number, one uppercase letter, one lowercase letter, and one special character."
      );
    }

    setLoading(true);
    try {
      await signUp({ name: form.name, email: form.email, password: form.password });
      toast.success("Account created! Please check your email for the verification code.");
      // Pass email to verification page so user doesn't have to re-type it
      navigate("/verify-email", { state: { email: form.email } });
    } catch (err) {
      const backendError = err?.response?.data?.error;
      const errorMessage =
        backendError?.fields?.[0]?.message ||
        backendError?.message ||
        err?.response?.data?.message ||
        "Failed to create account. Please try again.";
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
        <div className="absolute -top-20 -right-20 w-80 h-80 orb orb-blue opacity-50" />
        <div className="absolute bottom-20 -left-10 w-72 h-72 orb orb-cyan opacity-30" />
        <div className="absolute inset-0 dot-grid opacity-[0.04]" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <Zap size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold font-heading">LearnHub</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-black font-heading leading-tight mb-3 tracking-tight">
              Start your<br />
              <span className="text-gradient-brand">engineering career</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Join a community of engineers who chose depth over shortcuts.
            </p>
          </div>
          <ul className="space-y-3">
            {STEPS.map((step) => (
              <li key={step} className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 size={17} className="text-emerald-400 shrink-0" strokeWidth={2} />
                <span className="text-sm font-medium">{step}</span>
              </li>
            ))}
          </ul>

          {/* Social proof */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex -space-x-2 mb-3">
              {["AM", "PK", "SN", "RV", "AD"].map((initials, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-slate-900 bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-[10px] font-bold font-heading"
                >
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-300 font-medium">
              <strong className="text-white">45,000+</strong> learners joined this year
            </p>
          </div>
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
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
              <Zap size={14} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold font-heading text-slate-900">LearnHub</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-black font-heading text-slate-900 tracking-tight mb-2">
              Create your account
            </h1>
            <p className="text-slate-500">Free forever. No credit card required.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="input-group">
              <label htmlFor="name" className="label">Full Name</label>
              <input
                id="name"
                type="text"
                className="input"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoComplete="name"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="email" className="label">Email Address</label>
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
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  className="input pr-11"
                  placeholder="At least 8 mixed characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="new-password"
                  required
                  minLength={8}
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

              {/* Password strength */}
              {form.password && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((s) => (
                      <div
                        key={s}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          strength.level >= s ? strength.color : "bg-slate-100"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-medium text-slate-400">
                    Password strength:{" "}
                    <span
                      className={
                        strength.level >= 4
                          ? "text-emerald-600"
                          : strength.level >= 3
                          ? "text-yellow-600"
                          : strength.level >= 2
                          ? "text-orange-600"
                          : "text-red-600"
                      }
                    >
                      {strength.label}
                    </span>
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin-smooth" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Free Account
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-center text-slate-400 mt-4">
            By signing up, you agree to our{" "}
            <Link to="/" className="text-slate-600 hover:text-slate-900 underline">Terms</Link>
            {" & "}
            <Link to="/" className="text-slate-600 hover:text-slate-900 underline">Privacy Policy</Link>
          </p>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{" "}
            <Link to="/signin" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUpPage;
