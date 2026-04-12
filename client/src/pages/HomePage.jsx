import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getPublishedCourses } from "../api/services/courseService";
import CourseCard from "../components/CourseCard";
import SEO from "../components/SEO";
import { CourseGridSkeleton } from "../components/SkeletonLoader";
import {
  ArrowRight,
  Play,
  Sparkles,
  Code2,
  Server,
  Globe,
  Shield,
  Cpu,
  Star,
  Check,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

/* ── Data ─────────────────────────────────────────────────────────────────── */
const STATS = [
  { value: "45K+", label: "Active Learners" },
  { value: "120+", label: "Expert Courses" },
  { value: "4.9/5", label: "Avg. Rating" },
  { value: "98%", label: "Completion Rate" },
];

const FEATURES = [
  {
    icon: Code2,
    title: "Modern Stack",
    desc: "React 19, Next.js 15, Node.js, TypeScript — production patterns only.",
    color: "blue",
  },
  {
    icon: Server,
    title: "Real Architecture",
    desc: "System design, microservices, databases, and distributed systems.",
    color: "violet",
  },
  {
    icon: Globe,
    title: "Cloud Native",
    desc: "Deploy to AWS, GCP, Vercel, and edge networks at scale.",
    color: "cyan",
  },
];

const TESTIMONIALS = [
  {
    name: "Arjun Mehta",
    role: "SDE-2 @ Flipkart",
    text: "LearnHub completely changed how I think about system design. The course quality is unlike anything I've seen.",
    rating: 5,
    avatar: "AM",
  },
  {
    name: "Priya Nair",
    role: "Full-Stack Developer",
    text: "From zero to a production React app in 8 weeks. The structured curriculum is what makes the difference.",
    rating: 5,
    avatar: "PN",
  },
  {
    name: "Rohit Singh",
    role: "Backend Engineer @ Razorpay",
    text: "Finally, a platform that doesn't treat you like a beginner. Genuinely advanced content at a great price.",
    rating: 5,
    avatar: "RS",
  },
];

const TRUSTED_BY = ["Flipkart", "Razorpay", "CRED", "PhonePe", "Zepto", "Infosys"];

/* ── Animation variants ─────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

/* ── HomePage ─────────────────────────────────────────────────────────────── */
const HomePage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublishedCourses({ page: 1, limit: 6 })
      .then((data) => setCourses(data?.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-slate-900 text-slate-300 min-h-screen overflow-hidden">
      <SEO />

      {/* ════════════════════════════════════════════════════════════════════
          HERO
          ════════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-24 px-6 lg:px-8 overflow-hidden">

        {/* Background orbs */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] orb orb-blue opacity-60" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] orb orb-purple opacity-40" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] orb orb-cyan opacity-30" />

        {/* Dot grid overlay */}
        <div className="absolute inset-0 dot-grid opacity-[0.04]" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">

            {/* Left — Copy */}
            <div className="flex-1 space-y-8 text-center lg:text-left">

              {/* Eyebrow badge */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold font-heading mx-auto lg:mx-0"
              >
                <Sparkles size={14} />
                Redefining Tech Education in India
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl lg:text-[4.5rem] font-black font-heading text-white leading-[1.05] tracking-tight"
              >
                Master the art of{" "}
                <span className="text-gradient-brand">Software Engineering</span>
              </motion.h1>

              {/* Sub */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg text-slate-400 max-w-xl leading-relaxed mx-auto lg:mx-0"
              >
                Stop learning syntax. Build production-grade systems, understand real
                architecture, and become the engineer top companies want to hire.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-wrap items-center gap-4 justify-center lg:justify-start"
              >
                <Link to="/courses" className="btn-primary text-base px-7 py-3.5 shadow-2xl shadow-blue-500/30 rounded-2xl">
                  Explore Curriculum
                  <ArrowRight size={16} />
                </Link>
                <button className="flex items-center gap-3 px-6 py-3.5 rounded-2xl text-white font-semibold font-heading hover:bg-white/6 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                    <Play size={14} className="ml-0.5 text-white" fill="currentColor" />
                  </div>
                  Watch Demo
                </button>
              </motion.div>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-slate-800"
              >
                {STATS.map(({ value, label }) => (
                  <div key={label} className="text-center lg:text-left">
                    <p className="text-2xl font-black font-heading text-white">{value}</p>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">{label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — Code Window */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
              className="flex-1 w-full max-w-lg hidden lg:block animate-float"
            >
              <div className="glass-dark rounded-3xl p-1 shadow-2xl">
                <div className="bg-slate-900 rounded-[22px] overflow-hidden border border-white/5">
                  {/* Window chrome */}
                  <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5">
                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <div className="w-3 h-3 rounded-full bg-green-500/70" />
                    <span className="ml-3 text-xs text-slate-600 font-mono">learnhub/system.ts</span>
                  </div>
                  {/* Code */}
                  <pre className="text-[13px] font-mono leading-[1.8] p-6 overflow-x-auto">
                    <code>
                      <span className="text-slate-500">{"// Production-ready architecture\n"}</span>
                      <span className="text-blue-400">import</span>
                      {" { "}
                      <span className="text-cyan-300">architect</span>
                      {" } "}
                      <span className="text-blue-400">from</span>
                      {" "}
                      <span className="text-emerald-400">{"'@learnhub/core'"}</span>
                      {"\n\n"}
                      <span className="text-violet-400">const</span>
                      {" system = architect.{\n"}
                      {"  "}
                      <span className="text-slate-300">scale</span>
                      {": "}
                      <span className="text-amber-300">{"'global'"}</span>
                      {",\n"}
                      {"  "}
                      <span className="text-slate-300">stack</span>
                      {": ["}
                      <span className="text-emerald-400">{"'Next.js'"}</span>
                      {", "}
                      <span className="text-emerald-400">{"'Node'"}</span>
                      {", "}
                      <span className="text-emerald-400">{"'Postgres'"}</span>
                      {"],\n"}
                      {"  "}
                      <span className="text-slate-300">deploy</span>
                      {": "}
                      <span className="text-amber-300">{"'edge'"}</span>
                      {"\n}\n\n"}
                      <span className="text-slate-500">{"// Ship with confidence ✓\n"}</span>
                      <span className="text-slate-300">system</span>
                      {"."}
                      <span className="text-yellow-300">deploy</span>
                      {"()"}
                      {"."}
                      <span className="text-yellow-300">then</span>
                      {"("}
                      <span className="text-cyan-300">console.log</span>
                      {")"}
                    </code>
                  </pre>
                  {/* Status bar */}
                  <div className="flex items-center gap-3 px-5 py-3 border-t border-white/5 bg-slate-950/50">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-slate-500 font-mono">Build passing · 0 errors · TypeScript</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          TRUSTED BY
          ════════════════════════════════════════════════════════════════════ */}
      <section className="py-10 px-6 border-y border-slate-800/60 bg-slate-900/60">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-xs font-bold font-heading uppercase tracking-widest text-slate-600 mb-6">
            Learners now work at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-10">
            {TRUSTED_BY.map((name) => (
              <span
                key={name}
                className="text-slate-600 font-bold font-heading text-base hover:text-slate-400 transition-colors cursor-default"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          FEATURES
          ════════════════════════════════════════════════════════════════════ */}
      <section className="py-28 px-6 lg:px-8 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-blue-400 text-sm font-bold font-heading uppercase tracking-widest mb-3">
              Why LearnHub
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl lg:text-5xl font-black font-heading text-white tracking-tight">
              Built for engineers who <br />
              <span className="text-gradient-brand">want depth, not fluff</span>
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="group bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/50 hover:border-blue-500/30 rounded-3xl p-8 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                  color === "blue" ? "bg-blue-500/15 text-blue-400" :
                  color === "violet" ? "bg-violet-500/15 text-violet-400" :
                  "bg-cyan-500/15 text-cyan-400"
                } group-hover:scale-110 transition-transform`}>
                  <Icon size={26} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold font-heading text-white mb-3">{title}</h3>
                <p className="text-slate-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          COURSES
          ════════════════════════════════════════════════════════════════════ */}
      <section className="py-28 px-6 lg:px-8 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-blue-400 text-sm font-bold font-heading uppercase tracking-widest mb-3"
              >
                Elite Curriculum
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl lg:text-5xl font-black font-heading text-white tracking-tight"
              >
                Start Learning Today
              </motion.h2>
              <p className="text-slate-400 mt-3 text-lg max-w-xl">
                Created by industry veterans. Focused on depth and zero fluff.
              </p>
            </div>
            <Link
              to="/courses"
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold font-heading transition-colors shrink-0"
            >
              View all courses <ChevronRight size={18} />
            </Link>
          </div>

          {loading ? (
            /* Dark skeleton for dark homepage */
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-slate-800/50 rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-[16/10] bg-slate-700" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-slate-700 rounded w-3/4" />
                    <div className="h-3 bg-slate-700 rounded w-full" />
                    <div className="h-3 bg-slate-700 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, i) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                >
                  <CourseCard course={course} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          TESTIMONIALS
          ════════════════════════════════════════════════════════════════════ */}
      <section className="py-28 px-6 lg:px-8 bg-slate-900 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-blue-400 text-sm font-bold font-heading uppercase tracking-widest mb-3">
              Social Proof
            </p>
            <h2 className="text-4xl lg:text-5xl font-black font-heading text-white tracking-tight">
              What our learners say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, text, rating, avatar }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 hover:border-slate-600/60 transition-colors"
              >
                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: rating }).map((_, j) => (
                    <Star key={j} size={14} className="text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-300 leading-relaxed mb-6 text-[15px]">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold font-heading shrink-0">
                    {avatar}
                  </div>
                  <div>
                    <p className="text-white font-bold font-heading text-sm">{name}</p>
                    <p className="text-slate-500 text-xs">{role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          CTA
          ════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 lg:px-8 bg-slate-950">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-[2.5rem] overflow-hidden noise-overlay"
            style={{ background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #06b6d4 100%)" }}
          >
            <div className="absolute top-0 right-0 w-96 h-96 orb orb-cyan opacity-40" />
            <div className="relative z-10 p-12 md:p-20 text-center">
              <h2 className="text-4xl md:text-5xl font-black font-heading text-white mb-5 tracking-tight">
                Ready to level up?
              </h2>
              <p className="text-blue-100 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                Join 45,000+ engineers who chose depth over shortcuts. Your first lesson is free.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-white text-blue-700 rounded-2xl font-bold font-heading shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all w-full sm:w-auto text-center"
                >
                  Create Free Account
                </Link>
                <Link
                  to="/courses"
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-semibold font-heading border border-white/20 hover:bg-white/20 transition-all w-full sm:w-auto text-center"
                >
                  Browse Curriculum
                </Link>
              </div>
              <p className="text-blue-200/60 text-sm mt-6 flex items-center justify-center gap-2">
                <Check size={14} /> No credit card required
                <span className="mx-2">·</span>
                <Check size={14} /> Cancel anytime
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
