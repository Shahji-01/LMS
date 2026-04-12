import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getPublishedCourses, searchCourses } from "../api/services/courseService";
import CourseCard from "../components/CourseCard";
import SEO from "../components/SEO";
import { CourseGridSkeleton } from "../components/SkeletonLoader";
import EmptyState from "../components/EmptyState";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";

const LEVELS = ["all", "beginner", "intermediate", "advanced"];
const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "price-low", label: "Price ↑" },
  { value: "price-high", label: "Price ↓" },
];
const LEVEL_LABELS = { all: "All Levels", beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };

const CoursesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const q = searchParams.get("q") || "";
  const level = searchParams.get("level") || "all";
  const sort = searchParams.get("sort") || "newest";
  const page = Number(searchParams.get("page") || 1);
  const [searchInput, setSearchInput] = useState(q);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      let data;
      if (q) {
        data = await searchCourses({ query: q, level: level !== "all" ? level : undefined, sortBy: sort });
        setCourses(data?.data || []);
        setTotal(data?.count || 0);
        setTotalPages(1);
      } else {
        data = await getPublishedCourses({ page, limit: 9 });
        setCourses(data?.data?.data || []);
        setTotal(data?.data?.total || 0);
        setTotalPages(data?.data?.pages || 1);
      }
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [q, level, sort, page]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const setParam = (key, value) => {
    const params = Object.fromEntries(searchParams);
    if (value && value !== "all") params[key] = value;
    else delete params[key];
    if (key !== "page") delete params.page;
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setParam("q", searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput("");
    setParam("q", "");
  };

  const activeFiltersCount = [level !== "all" && level, sort !== "newest" && sort].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <SEO title="Browse Courses" description="Explore our catalog of premium engineering courses." />

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black font-heading text-slate-900 tracking-tight">
                Explore Curriculum
              </h1>
              <p className="text-slate-500 mt-1.5">
                {total > 0 ? `${total} courses available` : "Find the right program for your career"}
              </p>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 w-full md:max-w-md">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search courses..."
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold font-heading hover:bg-blue-700 transition-colors shrink-0"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">

        {/* ── Filter Row ─────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">

          {/* Level pills */}
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((l) => (
              <button
                key={l}
                onClick={() => setParam("level", l)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold font-heading transition-all ${
                  level === l
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                {LEVEL_LABELS[l]}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-500 hidden sm:block">Sort:</span>
            <div className="flex gap-1.5">
              {SORTS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setParam("sort", s.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-heading transition-all ${
                    sort === s.value
                      ? "bg-slate-900 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Active search indicator ──────────────────────────────────────────── */}
        {q && (
          <div className="mb-6 flex items-center gap-3">
            <p className="text-sm text-slate-500">
              Results for <span className="font-semibold text-slate-900">"{q}"</span>
            </p>
            <button
              onClick={clearSearch}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <X size={12} /> Clear
            </button>
          </div>
        )}

        {/* ── Course Grid ──────────────────────────────────────────────────── */}
        {loading ? (
          <CourseGridSkeleton count={9} />
        ) : courses.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-sm">
            <EmptyState
              title="No courses found"
              description={q ? `No results for "${q}". Try different keywords or remove filters.` : "No courses available yet. Check back soon!"}
              actionLabel="Clear Filters"
              onAction={() => { setSearchParams({}); setSearchInput(""); }}
            />
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.map((c, i) => (
                <motion.div
                  key={c._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                >
                  <CourseCard course={c} />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-14">
                <button
                  disabled={page <= 1}
                  onClick={() => setParam("page", page - 1)}
                  className="btn-secondary px-4 py-2 disabled:opacity-40 rounded-xl flex items-center gap-1.5 text-sm"
                >
                  <ChevronLeft size={15} /> Previous
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        onClick={() => setParam("page", p)}
                        className={`w-9 h-9 rounded-xl text-sm font-semibold font-heading transition-colors ${
                          page === p
                            ? "bg-blue-600 text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setParam("page", page + 1)}
                  className="btn-secondary px-4 py-2 disabled:opacity-40 rounded-xl flex items-center gap-1.5 text-sm"
                >
                  Next <ChevronRight size={15} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
