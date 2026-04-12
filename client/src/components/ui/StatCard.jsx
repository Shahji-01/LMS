import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

const colorMap = {
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-100",
    icon: "text-blue-600",
    ring: "ring-blue-100",
  },
  emerald: {
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    icon: "text-emerald-600",
    ring: "ring-emerald-100",
  },
  violet: {
    bg: "bg-violet-50",
    border: "border-violet-100",
    icon: "text-violet-600",
    ring: "ring-violet-100",
  },
  orange: {
    bg: "bg-orange-50",
    border: "border-orange-100",
    icon: "text-orange-600",
    ring: "ring-orange-100",
  },
  rose: {
    bg: "bg-rose-50",
    border: "border-rose-100",
    icon: "text-rose-600",
    ring: "ring-rose-100",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-100",
    icon: "text-amber-600",
    ring: "ring-amber-100",
  },
  cyan: {
    bg: "bg-cyan-50",
    border: "border-cyan-100",
    icon: "text-cyan-600",
    ring: "ring-cyan-100",
  },
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  color = "blue",
  trend,
  trendLabel,
  to,
  delay = 0,
}) => {
  const c = colorMap[color] || colorMap.blue;

  const inner = (
    <div className="flex items-start gap-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${c.bg} ${c.border}`}
      >
        {Icon && <Icon size={21} className={c.icon} strokeWidth={1.75} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-slate-500 mb-0.5 font-heading uppercase tracking-wide">
          {label}
        </p>
        <p className="text-2xl font-bold font-heading text-slate-900 tracking-tight truncate">
          {value ?? "—"}
        </p>
        {(sub || trend !== undefined) && (
          <div className="flex items-center gap-2 mt-1">
            {sub && (
              <p className="text-xs font-medium text-slate-400">{sub}</p>
            )}
            {trend !== undefined && (
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                  trend >= 0 ? "text-emerald-600" : "text-rose-500"
                }`}
              >
                {trend >= 0 ? (
                  <TrendingUp size={11} />
                ) : (
                  <TrendingDown size={11} />
                )}
                {Math.abs(trend)}%
              </span>
            )}
            {trendLabel && (
              <span className="text-xs text-slate-400">{trendLabel}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const baseClass =
    "bg-white rounded-2xl border border-slate-200 p-5 shadow-sm transition-all duration-200 block";
  const hoverClass = to
    ? "hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {to ? (
        <Link to={to} className={`${baseClass} ${hoverClass}`}>
          {inner}
        </Link>
      ) : (
        <div className={baseClass}>{inner}</div>
      )}
    </motion.div>
  );
};

export default StatCard;
