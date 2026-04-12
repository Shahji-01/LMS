import React, { useState } from "react";
import { changePassword } from "../api/services/userService.js";
import toast from "react-hot-toast";
import { KeyRound, ShieldCheck, Lock } from "lucide-react";

const ChangePasswordPage = () => {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "", // Added confirm field for better UX
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      toast.success("Password changed successfully!");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center pt-16 pb-20 px-6 sm:px-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">

      <div className="w-full max-w-md mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-heading font-black text-slate-900 tracking-tight flex items-center justify-center sm:justify-start gap-3">
          <span className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl shadow-sm border border-blue-100">
            <ShieldCheck className="w-8 h-8" />
          </span>
          Change Password
        </h1>
        <p className="text-slate-500 mt-3 text-lg">
          Secure your account with a strong, new password.
        </p>
      </div>

      <div className="w-full max-w-md">
        <div className="card p-8 sm:p-10 relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50/50 rounded-full blur-2xl pointer-events-none" />

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Current Password */}
            <div>
              <label className="label flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-slate-400" /> Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                placeholder="Enter current password"
                value={passwords.currentPassword}
                onChange={handleChange}
                required
                className="input"
              />
            </div>

            <div className="h-px w-full bg-slate-100 my-6" />

            {/* New Password */}
            <div>
              <label className="label flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-400" /> New Password
              </label>
              <input
                type="password"
                name="newPassword"
                placeholder="Enter new password (min. 8 chars)"
                value={passwords.newPassword}
                onChange={handleChange}
                required
                minLength={8}
                className="input"
              />
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="label flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-400" /> Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your new password"
                value={passwords.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
                className={`input ${passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                  : ""
                  }`}
              />
              {passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
                <p className="text-xs text-red-500 mt-2 font-medium">Passwords do not match.</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || (passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword)}
              className="btn-primary w-full h-12 shadow-lg shadow-blue-500/20 mt-4 relative active:scale-[0.98] transition-all"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Updating...
                </div>
              ) : (
                "Update Password"
              )}
            </button>

          </form>
        </div>
      </div>

    </div>
  );
};

export default ChangePasswordPage;
