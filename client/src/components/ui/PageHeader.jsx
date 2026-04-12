import React from "react";
import { motion } from "framer-motion";

const PageHeader = ({ title, subtitle, action, breadcrumb }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
  >
    <div>
      {breadcrumb && (
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 font-heading">
          {breadcrumb}
        </p>
      )}
      <h1 className="text-2xl lg:text-3xl font-bold font-heading text-slate-900 tracking-tight leading-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-[15px] text-slate-500 mt-1.5 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </motion.div>
);

export default PageHeader;
