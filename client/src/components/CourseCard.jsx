import React, { memo } from "react";
import { Link } from "react-router-dom";
import { Play, Users, Lock } from "lucide-react";
import Badge from "./ui/Badge.jsx";
import { optimizeImage } from "../utils/optimizeCloudinaryUrl.js";

const levelVariant = {
  beginner: "emerald",
  intermediate: "orange",
  advanced: "red",
};

const CourseCard = memo(({ course, to, showProgress = false }) => {
  const {
    _id,
    title,
    subtitle,
    thumbnail,
    instructor,
    price,
    level = "beginner",
    enrolledStudents = [],
    progress,
  } = course;

  const href = to || `/courses/${_id}`;

  return (
    <Link
      to={href}
      className="group block bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-blue-200 transition-all duration-250 overflow-hidden"
    >
      {/* ── Thumbnail ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden aspect-[16/10] bg-slate-100">
        {thumbnail ? (
          <img
            src={optimizeImage(thumbnail, 600, 375)}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <Play
              size={40}
              className="text-blue-300"
              strokeWidth={1.5}
            />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {level && (
            <Badge variant={levelVariant[level] || "slate"} size="sm">
              {level}
            </Badge>
          )}
        </div>

        {/* Play icon on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play size={18} className="text-blue-600 ml-0.5" fill="currentColor" />
          </div>
        </div>

        {/* Progress bar overlay (for enrolled courses) */}
        {showProgress && typeof progress === "number" && (
          <div className="absolute bottom-0 inset-x-0 h-1.5 bg-black/20">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="p-5">
        <h3 className="text-[15px] font-bold font-heading text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors mb-1.5">
          {title}
        </h3>

        {subtitle && (
          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-3">
            {subtitle}
          </p>
        )}

        {/* Instructor */}
        {instructor && (
          <div className="flex items-center gap-2 mb-4">
            <img
              src={
                instructor.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  instructor.name || "I"
                )}&background=6366f1&color=fff&size=32`
              }
              alt={instructor.name}
              className="w-5 h-5 rounded-full object-cover"
            />
            <span className="text-xs font-medium text-slate-500">
              {instructor.name}
            </span>
          </div>
        )}

        {/* Footer row */}
        <div className="flex items-center justify-between pt-3.5 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Users size={13} strokeWidth={1.8} />
            <span>{(enrolledStudents.length || 0).toLocaleString()} enrolled</span>
          </div>
          <span className="text-base font-bold font-heading text-blue-600">
            {price ? `₹${price.toLocaleString("en-IN")}` : "Free"}
          </span>
        </div>
      </div>
    </Link>
  );
});

CourseCard.displayName = "CourseCard";

export default CourseCard;
