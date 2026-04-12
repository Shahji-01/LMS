import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";

const EmptyState = ({
  icon: Icon = BookOpen,
  title = "Nothing here yet",
  description = "There's nothing to display right now.",
  actionLabel,
  actionTo,
  onAction,
}) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
      <Icon size={28} className="text-slate-400" strokeWidth={1.5} />
    </div>
    <h3 className="text-lg font-bold font-heading text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-6">{description}</p>
    {(actionLabel && actionTo) ? (
      <Link
        to={actionTo}
        className="btn-primary text-sm"
      >
        {actionLabel} <ArrowRight size={15} />
      </Link>
    ) : (actionLabel && onAction) ? (
      <button onClick={onAction} className="btn-secondary text-sm">
        {actionLabel}
      </button>
    ) : null}
  </div>
);

export default EmptyState;
