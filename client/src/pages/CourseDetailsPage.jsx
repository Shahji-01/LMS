import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getCourseById } from "../api/services/courseService";
import { getPurchaseStatus } from "../api/services/purchaseService";
import { useAuth } from "../context/AuthContext";
import { PageLoader } from "../components/SkeletonLoader";
import ReviewSection from "../components/ReviewSection";
import Badge from "../components/ui/Badge";
import SEO from "../components/SEO";
import { optimizeImage } from "../utils/optimizeCloudinaryUrl.js";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Users,
  Play,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  MonitorPlay,
  Smartphone,
  Award,
  ArrowLeft,
} from "lucide-react";

/* ── helpers ──────────────────────────────────────────────────────────────── */
const fmtDuration = (totalSec) => {
  const hrs  = Math.floor(Math.max(totalSec || 0, 0) / 3600);
  const mins = Math.floor((Math.max(totalSec || 0, 0) % 3600) / 60);
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
};

const levelVariant = { beginner: "emerald", intermediate: "orange", advanced: "red" };

/* ══════════════════════════════════════════════════════════════════════════ */
const CourseDetailsPage = () => {
  const { courseId: id } = useParams();
  const navigate         = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [course,          setCourse]          = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [isPurchased,     setIsPurchased]     = useState(false);
  const [curriculumOpen,  setCurriculumOpen]  = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchAll = async () => {
      try {
        const [courseRes, purchaseRes] = await Promise.all([
          getCourseById(id),
          isAuthenticated && user?.role === "student"
            ? getPurchaseStatus(id)
            : Promise.resolve({ data: { isPurchased: false } }),
        ]);
        const courseData = courseRes.data?.course || courseRes.data;
        setCourse(courseData);
        setIsPurchased(purchaseRes.data?.isPurchased || false);
      } catch {
        navigate("/404");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id, isAuthenticated, user, navigate]);

  if (loading) return <PageLoader />;
  if (!course)  return null;

  const { title, subtitle, description, thumbnail, instructor, price, level = "beginner", enrolledStudents, lectures, category } = course;
  const totalDuration = lectures?.reduce((acc, lec) => acc + (lec.duration || 0), 0) || 0;

  const INCLUDES = [
    { icon: Play,       label: `${fmtDuration(totalDuration)} on-demand video` },
    { icon: MonitorPlay, label: "Access on desktop & browser" },
    { icon: Smartphone, label: "Access on mobile" },
    { icon: Award,      label: "Certificate of completion" },
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-24 pt-16">
      <SEO title={title} description={subtitle || description.substring(0, 160)} image={thumbnail} />

      {/* ════════════════════════════════════════════════════════════════════
          HERO BANNER — full-width dark with all course meta
          ════════════════════════════════════════════════════════════════════ */}
      <div className="bg-slate-900 pt-12 pb-16 px-6 lg:px-8 relative overflow-hidden">
        {/* Orbs */}
        <div className="absolute -top-20 right-0 w-96 h-96 orb orb-blue opacity-30 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 orb orb-purple opacity-20 pointer-events-none" />
        <div className="absolute inset-0 dot-grid opacity-[0.035]" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <Link
            to="/courses"
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm font-medium mb-6"
          >
            <ArrowLeft size={14} /> Back to Courses
          </Link>

          <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">
            {/* Left — metadata */}
            <div className="space-y-5">
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-3">
                {level && (
                  <Badge variant={levelVariant[level] || "slate"}>
                    {level}
                  </Badge>
                )}
                {category && (
                  <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">
                    {category}
                  </span>
                )}
              </div>

              <h1 className="text-3xl lg:text-[2.6rem] font-black font-heading text-white leading-[1.12] tracking-tight">
                {title}
              </h1>

              {subtitle && (
                <p className="text-lg text-slate-300 leading-relaxed max-w-2xl">
                  {subtitle}
                </p>
              )}

              {/* Meta stats */}
              <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-800">
                {/* Instructor */}
                <div className="flex items-center gap-3">
                  <img
                    src={
                      instructor?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor?.name || "I")}&background=2563eb&color=fff&size=80`
                    }
                    alt={instructor?.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-700"
                  />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Created by</p>
                    <p className="text-white font-semibold text-sm">{instructor?.name}</p>
                  </div>
                </div>

                <div className="w-px h-8 bg-slate-800 hidden sm:block" />

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Users size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Enrolled</p>
                    <p className="text-white font-semibold text-sm">
                      {(enrolledStudents?.length || 0).toLocaleString()} students
                    </p>
                  </div>
                </div>

                <div className="w-px h-8 bg-slate-800 hidden sm:block" />

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
                    <Clock size={16} className="text-violet-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Duration</p>
                    <p className="text-white font-semibold text-sm">{fmtDuration(totalDuration)} total</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — thumbnail preview (hero, not the purchase card) */}
            <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-800 hidden lg:block">
              {thumbnail ? (
                <img
                  src={optimizeImage(thumbnail, 800, null)}
                  alt={title}
                  className="w-full h-full object-cover opacity-80"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play size={48} className="text-slate-600" strokeWidth={1.5} />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-2xl">
                  <Play size={22} className="text-blue-600 ml-1" fill="currentColor" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          MAIN BODY — Two column: content | sticky purchase card
          ════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-10">
        <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">

          {/* ── Left Column ───────────────────────────────────────────────── */}
          <div className="space-y-8">

            {/* About */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <h2 className="text-xl font-black font-heading text-slate-900 mb-5">
                About This Course
              </h2>
              <p className="text-slate-600 leading-relaxed text-[15px] mb-6">{description}</p>
              <p className="text-slate-600 leading-relaxed text-[15px]">
                By the end, you will be able to build production-grade applications
                using the architectural patterns taught across the modules below.
              </p>

              {/* What you'll learn */}
              <div className="grid sm:grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-100">
                {[
                  "Build scalable full-stack applications",
                  "Understand complex state management",
                  "Deploy to cloud infrastructure",
                  "Implement secure authentication",
                ].map((item) => (
                  <div key={item} className="flex gap-3 items-start">
                    <CheckCircle2
                      size={16}
                      className="text-emerald-500 shrink-0 mt-0.5"
                      strokeWidth={2}
                    />
                    <span className="text-slate-700 text-[14px] font-medium leading-snug">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Header */}
              <button
                onClick={() => setCurriculumOpen((p) => !p)}
                className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors border-b border-slate-100"
              >
                <div className="text-left">
                  <h2 className="text-xl font-black font-heading text-slate-900">
                    Course Curriculum
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {lectures?.length || 0} lectures &middot; {fmtDuration(totalDuration)} video content
                  </p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  {curriculumOpen
                    ? <ChevronUp size={18} className="text-slate-600" />
                    : <ChevronDown size={18} className="text-slate-600" />
                  }
                </div>
              </button>

              {/* Lecture List */}
              <AnimatePresence initial={false}>
                {curriculumOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    {!lectures || lectures.length === 0 ? (
                      <p className="p-8 text-center text-slate-500 text-sm">
                        Content is being prepared by the instructor.
                      </p>
                    ) : (
                      <ul className="divide-y divide-slate-50">
                        {lectures.map((lec, i) => (
                          <li
                            key={lec._id}
                            className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/80 transition-colors group"
                          >
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                lec.isPreview
                                  ? "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                                  : "bg-slate-100 text-slate-400"
                              }`}
                            >
                              {lec.isPreview
                                ? <Play size={13} className="ml-0.5" fill="currentColor" />
                                : <Lock size={13} />
                              }
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className={`font-medium text-[14px] truncate ${lec.isPreview ? "text-slate-900" : "text-slate-600"}`}>
                                {i + 1}. {lec.title}
                              </p>
                              {lec.description && (
                                <p className="text-xs text-slate-400 mt-0.5 truncate">
                                  {lec.description}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              {lec.isPreview && (
                                <span className="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                  Preview
                                </span>
                              )}
                              <span className="text-xs font-semibold text-slate-400 w-12 text-right">
                                {fmtDuration(lec.duration)}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Reviews */}
            <ReviewSection courseId={id} isPurchased={isPurchased} instructorId={instructor?._id} />
          </div>

          {/* ── Right Column — Sticky Purchase Card ───────────────────────── */}
          <div className="lg:sticky lg:top-6 space-y-5">

            {/* Purchase Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-900/6 overflow-hidden">
              {/* Thumbnail */}
              <div className="relative aspect-[16/10] bg-slate-100">
                {thumbnail ? (
                  <img
                    src={optimizeImage(thumbnail, 600, 375)}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                    <Play size={40} className="text-blue-300" strokeWidth={1.5} />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/15 hover:bg-black/25 transition-colors cursor-pointer">
                  <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                    <Play size={18} className="text-blue-600 ml-0.5" fill="currentColor" />
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Price */}
                <div>
                  <span className="text-4xl font-black font-heading text-blue-600 tracking-tight">
                    {price ? `₹${Number(price).toLocaleString("en-IN")}` : "Free"}
                  </span>
                </div>

                {/* CTA buttons */}
                <div className="space-y-2.5">
                  {isAuthenticated && user?.role === "instructor" ? (
                    <div className="py-3 px-4 bg-slate-100 text-slate-400 rounded-xl text-sm font-semibold text-center">
                      Instructors cannot enroll
                    </div>
                  ) : isPurchased ? (
                    <button
                      onClick={() => navigate(`/course-progress/${course._id}`)}
                      className="btn-primary w-full py-3.5 text-[15px] rounded-xl"
                    >
                      Continue Learning
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/checkout/${course._id}`)}
                      className="btn-primary w-full py-3.5 text-[15px] rounded-xl"
                    >
                      Enroll Now
                    </button>
                  )}
                  <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                    30-Day Money-Back Guarantee
                  </p>
                </div>

                {/* Includes */}
                <div className="pt-5 border-t border-slate-100 space-y-3">
                  <p className="text-sm font-bold font-heading text-slate-900">
                    This course includes:
                  </p>
                  {INCLUDES.map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-3 text-sm text-slate-600">
                      <Icon size={15} className="text-slate-400 shrink-0" strokeWidth={1.8} />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Instructor Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="font-bold font-heading text-slate-900">Your Instructor</h3>
              <div className="flex items-start gap-4">
                <img
                  src={
                    instructor?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor?.name || "I")}&background=2563eb&color=fff&size=80`
                  }
                  alt={instructor?.name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-bold font-heading text-slate-900 text-[15px] leading-tight">
                    {instructor?.name}
                  </p>
                  <p className="text-sm text-slate-500 mt-1.5 leading-relaxed line-clamp-3">
                    {instructor?.bio ||
                      "Expert instructor at LearnHub. Passionate about teaching and helping engineers level up their skills."}
                  </p>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-medium">
              <ShieldCheck size={14} className="text-emerald-500" />
              Secure checkout · SSL encrypted
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;
