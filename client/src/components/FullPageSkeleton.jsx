import React from "react";
import { Zap } from "lucide-react";

const FullPageSkeleton = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
    <div className="relative">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
        <Zap size={22} className="text-white" strokeWidth={2.5} />
      </div>
      <div className="absolute -inset-2 rounded-3xl border-2 border-blue-500/20 animate-ping" />
    </div>
    <div className="text-center">
      <p className="font-bold font-heading text-slate-900 text-sm">LearnHub</p>
      <p className="text-xs text-slate-400 mt-0.5">Loading...</p>
    </div>
  </div>
);

export default FullPageSkeleton;
