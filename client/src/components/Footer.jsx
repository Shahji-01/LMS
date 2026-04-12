import React from "react";
import { Link } from "react-router-dom";
import { Zap, Twitter, Github, Linkedin, ArrowRight } from "lucide-react";
import ROUTES from "../routes.jsx";

const FOOTER_LINKS = {
  Platform: [
    { label: "Browse Courses", to: ROUTES.COURSES_PUBLISHED },
    { label: "Instructors", to: "/" }, // Should ideally point to instructor signup/info
    { label: "Pricing", to: ROUTES.COURSES_PUBLISHED },
  ],
  Learn: [
    { label: "Dashboard", to: ROUTES.DASHBOARD },
    { label: "My Library", to: ROUTES.MY_COURSES },
    { label: "Certificates", to: ROUTES.DASHBOARD },
  ],
  Company: [
    { label: "About Us", to: "/" },
    { label: "Blog", to: "/" },
    { label: "Careers", to: "/" },
  ],
};

const Footer = () => (
  <footer className="bg-slate-900 text-slate-400">
    <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-8">

      {/* ── Top Section ── */}
      <div className="grid lg:grid-cols-5 gap-10 mb-12">

        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-2.5 group w-fit">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Zap size={15} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-white font-bold font-heading text-lg">LearnHub</span>
          </Link>
          <p className="text-sm leading-relaxed max-w-xs text-slate-500">
            The platform where serious engineers level up. Expert-led courses focused on depth, real architecture, and production-grade skills.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-3 pt-1">
            {[
              { icon: Twitter, href: "#", label: "Twitter" },
              { icon: Github, href: "#", label: "GitHub" },
              { icon: Linkedin, href: "#", label: "LinkedIn" },
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
              >
                <Icon size={15} className="text-slate-400 hover:text-white transition-colors" />
              </a>
            ))}
          </div>
        </div>

        {/* Link Columns */}
        {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
          <div key={heading}>
            <h4 className="text-sm font-bold font-heading text-white uppercase tracking-widest mb-4" style={{ letterSpacing: "0.06em" }}>
              {heading}
            </h4>
            <ul className="space-y-2.5">
              {links.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-slate-500 hover:text-slate-200 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Newsletter Row ── */}
      <div className="rounded-2xl bg-slate-800/60 border border-slate-700/60 p-6 mb-10 flex flex-col sm:flex-row items-center justify-between gap-5">
        <div>
          <p className="text-white font-bold font-heading">Stay in the loop</p>
          <p className="text-sm text-slate-500 mt-0.5">Get new courses and updates delivered to your inbox.</p>
        </div>
        <form className="flex gap-2 w-full sm:w-auto" onSubmit={e => e.preventDefault()}>
          <input
            type="email"
            placeholder="your@email.com"
            className="px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 flex-1 sm:w-60"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold font-heading transition-colors flex items-center gap-1.5 shrink-0"
          >
            Subscribe <ArrowRight size={14} />
          </button>
        </form>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-800">
        <p className="text-xs text-slate-600">
          © {new Date().getFullYear()} LearnHub. All rights reserved.
        </p>
        <div className="flex items-center gap-5">
          {["Privacy Policy", "Terms of Service", "Cookies"].map((item) => (
            <Link key={item} to="/" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
              {item}
            </Link>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
