import React, { useState } from "react";
import axios from "axios";

const ChangePasswordPage = () => {
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.patch("/api/v1/user/change-password", passwords);
      alert("Password changed successfully!");
      setPasswords({ oldPassword: "", newPassword: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-md mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-semibold">
            Change Password
          </h2>
          <p className="text-gray-600 mt-2">
            Update your account password
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Old Password */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Current password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwords.oldPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    oldPassword: e.target.value,
                  })
                }
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-black/80"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium mb-1">
                New password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    newPassword: e.target.value,
                  })
                }
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-black/80"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-black text-white font-medium
                         hover:bg-black/90 transition disabled:opacity-60"
            >
              {loading ? "Updating..." : "Change Password"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ChangePasswordPage;
