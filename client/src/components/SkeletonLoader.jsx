import React from "react";

/* ── Skeleton Primitives ──────────────────────────────────────────────────── */
const Skel = ({ className = "" }) => (
  <div className={`skeleton ${className}`} aria-hidden="true" />
);

/* ── Course Card Skeleton ─────────────────────────────────────────────────── */
export const CourseCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
    <Skel className="aspect-[16/10] w-full rounded-none" />
    <div className="p-5 space-y-3">
      <Skel className="h-4 w-3/4" />
      <Skel className="h-3 w-full" />
      <Skel className="h-3 w-2/3" />
      <div className="flex items-center gap-2 pt-1">
        <Skel className="w-5 h-5 rounded-full" />
        <Skel className="h-3 w-24" />
      </div>
      <div className="flex justify-between pt-3 border-t border-slate-50">
        <Skel className="h-3 w-20" />
        <Skel className="h-4 w-16" />
      </div>
    </div>
  </div>
);

/* ── Course Grid Skeleton ─────────────────────────────────────────────────── */
export const CourseGridSkeleton = ({ count = 6 }) => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <CourseCardSkeleton key={i} />
    ))}
  </div>
);

/* ── Table Skeleton ───────────────────────────────────────────────────────── */
export const TableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 py-1">
        <Skel className="w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skel className="h-3.5 w-2/3" />
          <Skel className="h-3 w-1/3" />
        </div>
        <Skel className="h-6 w-16 rounded-lg" />
        <Skel className="h-8 w-8 rounded-lg" />
      </div>
    ))}
  </div>
);

/* ── Dashboard Stats Skeleton ─────────────────────────────────────────────── */
export const StatsSkeleton = ({ count = 3 }) => (
  <div className={`grid gap-5 ${count === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <Skel className="w-12 h-12 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skel className="h-3 w-24" />
            <Skel className="h-6 w-16" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/* ── Profile Skeleton ─────────────────────────────────────────────────────── */
export const ProfileSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8 max-w-4xl">
    <div className="flex items-center gap-6">
      <Skel className="w-24 h-24 rounded-full" />
      <div className="space-y-3 flex-1">
        <Skel className="h-6 w-48" />
        <Skel className="h-4 w-64" />
      </div>
    </div>
    <div className="grid sm:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          <Skel className="h-3 w-20" />
          <Skel className="h-11 w-full" />
        </div>
      ))}
    </div>
  </div>
);

/* ── Page Loader (Full) ───────────────────────────────────────────────────── */
export const PageLoader = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 rounded-full border-[3px] border-slate-200 border-t-blue-600 animate-spin-smooth" />
      <p className="text-sm font-medium text-slate-400 font-heading">Loading...</p>
    </div>
  </div>
);

/* ── Text Block Skeleton ──────────────────────────────────────────────────── */
export const TextBlockSkeleton = ({ lines = 4 }) => (
  <div className="space-y-2.5">
    {Array.from({ length: lines }).map((_, i) => (
      <Skel
        key={i}
        className="h-3.5"
        style={{ width: i === lines - 1 ? "60%" : i % 3 === 0 ? "85%" : "100%" }}
      />
    ))}
  </div>
);

export default CourseCardSkeleton;
