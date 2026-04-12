import React, { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/services/authService";
import { BookOpen, Mail } from "lucide-react";
import toast from "react-hot-toast";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email address.");
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
      toast.success("Reset link sent! Check your inbox.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        <Link to="/" className="flex items-center gap-2 justify-center">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">LearnHub</span>
        </Link>

        <div className="card p-8 space-y-6">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto">
                <Mail className="w-7 h-7 text-green-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Check your email</h1>
              <p className="text-sm text-gray-500">
                We sent a password reset link to <strong>{email}</strong>
              </p>
              <Link to="/signin" className="btn-primary w-full block text-center">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Forgot your password?</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Email address</label>
                  <input
                    className="input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
              <Link to="/signin" className="block text-center text-sm text-indigo-600 hover:underline">
                Back to Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
