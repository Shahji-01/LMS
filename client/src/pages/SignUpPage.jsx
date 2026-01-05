import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { signupSchema } from "../validators/signUp.schema";

const Signup = () => {
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data) => {
    setServerError(null);
    try {
      const payload = {
        ...data,
        role, // 👈 very important
      };

      console.log("Signup payload:", payload);
      // await api.post("/auth/signup", payload);
    } catch (err) {
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-8">

        {/* Role Toggle */}
        <div className="relative flex mb-8 rounded-full bg-gray-100 p-1">
          <div
            className={`absolute top-1 left-1 w-1/2 h-[calc(100%-0.5rem)] bg-black rounded-full transition-transform duration-300 ${
              role === "instructor" ? "translate-x-full" : "translate-x-0"
            }`}
          />
          {["student", "instructor"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`relative w-1/2 py-2 text-sm font-medium rounded-full transition ${
                role === r ? "text-white" : "text-gray-600"
              }`}
            >
              {r === "student" ? "Student" : "Instructor"}
            </button>
          ))}
        </div>

        {/* Header */}
        <h1 className="text-2xl font-semibold text-center">
          Create your account
        </h1>
        <p className="text-sm text-gray-600 text-center mt-1 mb-6">
          Sign up as a {role}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* Name */}
          <div className="mb-5">
            <label className="block text-sm font-medium mb-1">
              Full name
            </label>
            <input
              {...register("name")}
              placeholder="John Doe"
              className={`w-full rounded-xl border px-4 py-2.5 text-sm
                ${errors.name ? "border-red-500" : "border-gray-300"}
                focus:outline-none focus:ring-2 focus:ring-black/80`}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="mb-5">
            <label className="block text-sm font-medium mb-1">
              Email address
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder="you@example.com"
              className={`w-full rounded-xl border px-4 py-2.5 text-sm
                ${errors.email ? "border-red-500" : "border-gray-300"}
                focus:outline-none focus:ring-2 focus:ring-black/80`}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mb-4 relative">
            <label className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="••••••••"
              className={`w-full rounded-xl border px-4 py-2.5 pr-10 text-sm
                ${errors.password ? "border-red-500" : "border-gray-300"}
                focus:outline-none focus:ring-2 focus:ring-black/80`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-500 text-sm"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {serverError && (
            <p className="text-sm text-red-500 mb-4 text-center">
              {serverError}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-black text-white font-medium
                       hover:bg-black/90 transition disabled:opacity-60 mb-4"
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>

          {/* Redirect to Login */}
          <p className="text-sm text-center text-gray-600">
            Already have an account?{" "}
            <Link
              to="/signin"
              className="font-medium text-black hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
