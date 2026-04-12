import React from "react";

const variants = {
  blue:    "bg-blue-50 text-blue-700 border-blue-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  orange:  "bg-orange-50 text-orange-700 border-orange-200",
  red:     "bg-red-50 text-red-700 border-red-200",
  rose:    "bg-rose-50 text-rose-700 border-rose-200",
  violet:  "bg-violet-50 text-violet-700 border-violet-200",
  slate:   "bg-slate-100 text-slate-600 border-slate-200",
  amber:   "bg-amber-50 text-amber-700 border-amber-200",
  cyan:    "bg-cyan-50 text-cyan-700 border-cyan-200",
  green:   "bg-green-50 text-green-700 border-green-200",
};

const sizeMap = {
  sm: "px-2 py-0.5 text-[10px] tracking-wider",
  md: "px-2.5 py-0.5 text-xs",
  lg: "px-3 py-1 text-xs",
};

const Badge = ({ children, variant = "slate", size = "md", className = "", dot = false }) => (
  <span
    className={`inline-flex items-center gap-1.5 font-semibold uppercase rounded-full border font-heading ${
      variants[variant] || variants.slate
    } ${sizeMap[size] || sizeMap.md} ${className}`}
    style={{ letterSpacing: "0.04em" }}
  >
    {dot && (
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0" />
    )}
    {children}
  </span>
);

export default Badge;
