import React, { useState } from "react";
import { Link } from "react-router-dom";
import ROUTES from "../../routes";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Send forgot password email to:", email);
    alert("Check your email for reset instructions!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-8">

        {/* Header */}
        <h2 className="text-2xl font-semibold text-center">
          Forgot your password?
        </h2>
        <p className="text-sm text-gray-600 text-center mt-2 mb-6">
          Enter your email and we’ll send you reset instructions.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Email address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-black/80"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-black text-white font-medium
                       hover:bg-black/90 transition"
          >
            Send Reset Link
          </button>
        </form>

        {/* Footer */}
        <p className="text-sm text-gray-600 text-center mt-6">
          Remember your password?{" "}
          <Link
            to={ROUTES.SIGNIN}
            className="text-black font-medium hover:underline"
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
