import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getCourseProgress,
  updateLectureProgress,
  markCourseComplete,
  resetCourseProgress,
} from "../api/services/progressService.js";
import { getCourseById } from "../api/services/courseService.js";
import { getCourseQuizzes } from "../api/services/quizService.js";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  Circle,
  Play,
  ArrowRight,
  Download,
  FileText,
  Award,
  Lightbulb,
  RotateCcw,
} from "lucide-react";
import { motion } from "framer-motion";

const CourseProgressPage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [quizSubmissions, setQuizSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const [courseData, progressData, quizData] = await Promise.all([
        getCourseById(courseId),
        getCourseProgress(courseId),
        getCourseQuizzes(courseId).catch(() => ({ data: { quizzes: [], submissions: [] } })),
      ]);
      setCourse(courseData?.data?.course || courseData?.data || courseData);
      const prog = progressData?.data || progressData;
      setLectures(prog?.lectureProgress || []);
      const qData = quizData?.data || quizData;
      setQuizzes(qData?.quizzes || []);
      setQuizSubmissions(qData?.submissions || []);
    } catch {
      setError("Failed to load your progress. Make sure you're enrolled in this course.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { load(); }, [load]);

  const toggleCompleted = async (lectureId, completed) => {
    try {
      await updateLectureProgress(courseId, lectureId, completed);
      setLectures((prev) =>
        prev.map((lec) =>
          lec.lecture === lectureId || lec._id === lectureId
            ? { ...lec, isCompleted: completed }
            : lec
        )
      );
      if (completed) toast.success("Marked as complete!");
    } catch {
      toast.error("Failed to update progress.");
    }
  };

  const handleMarkComplete = async () => {
    try {
      await markCourseComplete(courseId);
      toast.success("Course completed! 🎉");
      load();
    } catch (err) {
      toast.error(err.message || "Failed to mark complete.");
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Reset all progress for this course? This cannot be undone.")) return;
    try {
      await resetCourseProgress(courseId);
      toast.success("Progress reset.");
      load();
    } catch (err) {
      toast.error(err.message || "Failed to reset.");
    }
  };

  const completedCount = lectures.filter((l) => l.isCompleted || l.completed).length;
  const total = lectures.length;
  const pct = total === 0 ? 0 : Math.round((completedCount / total) * 100);
  const allDone = completedCount === total && total > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-[3px] border-slate-200 border-t-blue-600 animate-spin-smooth" />
          <p className="text-sm text-slate-400 font-medium">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center text-red-700">
          <p className="font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold font-heading text-slate-400 uppercase tracking-widest mb-2">Course Progress</p>
        <h1 className="text-2xl lg:text-3xl font-black font-heading text-slate-900 tracking-tight">
          {course?.title || "My Course"}
        </h1>
        <p className="text-slate-500 mt-1.5">
          {completedCount} of {total} lectures completed
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">

        {/* ── Lecture List ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-6 order-2 lg:order-1">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold font-heading text-slate-900">Course Curriculum</h2>
              <span className="text-sm text-slate-400 font-medium">{total} lectures</span>
            </div>

            {lectures.length === 0 ? (
              <div className="p-12 text-center">
                <Play size={32} className="text-slate-300 mx-auto mb-3" />
                <p className="font-semibold text-slate-600">No lectures yet</p>
                <p className="text-sm text-slate-400 mt-1">The instructor hasn&apos;t added content yet.</p>
              </div>
            ) : (
              <ul>
                {lectures.map((lec, i) => {
                  const lId = lec.lecture || lec._id;
                  const done = lec.isCompleted || lec.completed;
                  const title = lec.lectureTitle || lec.title || `Lecture ${i + 1}`;
                  return (
                    <motion.li
                      key={lId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-slate-50 last:border-0 group hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-4 p-4 sm:p-5">
                        {/* Play Button */}
                        <Link
                          to={`/course-progress/${courseId}/lecture/${lId}`}
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            done
                              ? "bg-emerald-50 text-emerald-500 group-hover:bg-emerald-100"
                              : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                          }`}
                        >
                          <Play size={14} className="ml-0.5" fill="currentColor" />
                        </Link>

                        {/* Title */}
                        <div className="flex-1 min-w-0">
                          <Link to={`/course-progress/${courseId}/lecture/${lId}`} className="block">
                            <p className={`text-[15px] font-semibold truncate transition-colors ${
                              done ? "text-slate-400 line-through decoration-slate-300" : "text-slate-900 group-hover:text-blue-600"
                            }`}>
                              {i + 1}. {title}
                            </p>
                            {done && (
                              <p className="text-xs text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
                                <CheckCircle2 size={11} strokeWidth={2.5} /> Completed
                              </p>
                            )}
                          </Link>
                        </div>

                        {/* Toggle */}
                        <button
                          onClick={() => toggleCompleted(lId, !done)}
                          className={`shrink-0 transition-all ${
                            done
                              ? "text-emerald-500 hover:text-slate-300"
                              : "text-slate-300 hover:text-emerald-500"
                          }`}
                          title={done ? "Mark as incomplete" : "Mark as complete"}
                        >
                          {done
                            ? <CheckCircle2 size={22} strokeWidth={2} />
                            : <Circle size={22} strokeWidth={1.5} />
                          }
                        </button>
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Quizzes */}
          {quizzes.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h2 className="font-bold font-heading text-slate-900">Assessments</h2>
              </div>
              <ul>
                {quizzes.map((quiz, i) => {
                  const sub = quizSubmissions.find((s) => s.quiz === quiz._id);
                  const passed = sub?.passed;
                  return (
                    <li key={quiz._id} className="border-b border-slate-50 last:border-0 group hover:bg-slate-50 transition-colors">
                      <Link to={`/course-progress/${courseId}/quiz/${quiz._id}`} className="flex items-center gap-4 p-4 sm:p-5">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          sub ? (passed ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500")
                              : "bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white"
                        } transition-colors`}>
                          <FileText size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-semibold text-slate-900 truncate group-hover:text-violet-600 transition-colors">
                            Quiz {i + 1}: {quiz.title}
                          </p>
                          {sub ? (
                            <p className={`text-xs font-medium mt-0.5 ${passed ? "text-emerald-600" : "text-red-500"}`}>
                              {passed ? "Passed" : "Failed"} · Score: {sub.score}%
                            </p>
                          ) : (
                            <p className="text-xs text-slate-400 mt-0.5">
                              {quiz.questions?.length || 0} questions · Pass: {quiz.passingScore}%
                            </p>
                          )}
                        </div>
                        <ArrowRight size={16} className="text-slate-300 group-hover:text-violet-500 transition-colors shrink-0" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* ── Progress Sidebar ──────────────────────────────────────────────── */}
        <div className="lg:col-span-4 order-1 lg:order-2 space-y-5 lg:sticky lg:top-24">

          {/* Progress Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold font-heading text-slate-900">Your Progress</h3>
              <span className="text-2xl font-black font-heading text-slate-900">
                {pct}
                <span className="text-base text-slate-400">%</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mb-4">
              {completedCount} of {total} lectures complete
            </p>

            {/* Progress bar */}
            <div className="progress-track mb-6">
              <motion.div
                className={`progress-fill ${allDone ? "progress-fill-success" : ""}`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>

            {allDone && (
              <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
                <Award size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-800 text-sm">Course completed!</p>
                  <p className="text-xs text-emerald-700/80 mt-0.5">You've mastered all lectures. Claim your certificate.</p>
                </div>
              </div>
            )}

            <div className="space-y-2.5">
              <button
                onClick={handleMarkComplete}
                disabled={allDone || total === 0}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {allDone ? <><CheckCircle2 size={15} /> Completed!</> : "Mark Course Complete"}
              </button>

              {allDone && (
                <Link
                  to={`/certificate/${courseId}`}
                  className="btn-secondary w-full justify-center text-sm"
                >
                  <Download size={15} /> View Certificate
                </Link>
              )}

              <button
                onClick={handleReset}
                disabled={pct === 0}
                className="btn-ghost w-full text-sm text-slate-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-40"
              >
                <RotateCcw size={14} /> Reset Progress
              </button>
            </div>
          </div>

          {/* Tip Card */}
          <div className="bg-slate-900 rounded-2xl p-5 hidden sm:block">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-yellow-500/20 flex items-center justify-center shrink-0">
                <Lightbulb size={16} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-white font-bold font-heading text-sm mb-1">Pro Tip</p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Consistent practice beats intensity. Try to complete one lecture every day to build unstoppable momentum.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseProgressPage;
