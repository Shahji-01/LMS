import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCourseLectures } from "../api/services/courseService.js";
import { Video, Plus, LayoutGrid, ArrowLeft } from "lucide-react";

const ManageLecturesPage = () => {
  const { courseId } = useParams();
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getCourseLectures(courseId);
        setLectures(data?.data?.lectures || data?.lectures || []);
      } catch {
        setError("Failed to load lectures.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId]);

  return (
    <div className="min-h-screen pt-10 pb-20 px-6 sm:px-8 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
        <div>
          <Link to={`/instructor/course/${courseId}/edit`} className="text-sm font-medium text-slate-500 hover:text-blue-600 mb-4 inline-flex items-center gap-1 group transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Course Edit
          </Link>
          <h1 className="text-3xl font-heading font-black text-slate-900 tracking-tight">Manage Lectures</h1>
          <p className="text-slate-500 mt-2 text-[15px]">Organize and update the curriculum for your course.</p>
        </div>

        <Link
          to={`/instructor/course/${courseId}/lectures/add`}
          className="btn-primary shrink-0 shadow-lg shadow-blue-500/25 gap-2"
        >
          <Plus className="w-5 h-5" /> Add New Lecture
        </Link>
      </div>

      {/* Content */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Loading lectures...</p>
        </div>
      )}

      {error && (
        <div className="card w-full p-8 text-center text-red-500 font-medium bg-red-50/50 border-red-100">
          {error}
        </div>
      )}

      {!loading && !error && lectures.length === 0 && (
        <div className="card p-12 text-center flex flex-col items-center border-dashed border-2">
          <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-6">
            <Video className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-heading font-bold text-slate-900 mb-2">No Lectures Yet</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            Your course is currently empty. Start building your curriculum by adding your first video lecture.
          </p>
          <Link
            to={`/instructor/course/${courseId}/lectures/add`}
            className="btn-primary shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-5 h-5 mr-2" /> Add Your First Lecture
          </Link>
        </div>
      )}

      {!loading && lectures.length > 0 && (
        <div className="card overflow-hidden">
          <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-100 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <LayoutGrid className="w-5 h-5 text-slate-400" /> Course Curriculum ({lectures.length})
          </div>
          <ul className="divide-y divide-slate-100">
            {lectures.map((lec, index) => (
              <li key={lec._id} className="group hover:bg-slate-50 transition-colors p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm shrink-0">
                    {index + 1}
                  </div>
                  <div className="pt-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate pr-4 text-base">{lec.title}</p>
                    {lec.description ? (
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2 md:line-clamp-1 leading-relaxed">{lec.description}</p>
                    ) : (
                      <p className="text-sm text-slate-400 italic mt-1">No description provided.</p>
                    )}
                  </div>
                </div>

                {/* Meta + Actions */}
                <div className="flex items-center gap-3 shrink-0 ml-12 sm:ml-0 mt-2 sm:mt-0">
                  {lec.isPreview && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
                      Free Preview
                    </span>
                  )}
                  {lec.duration > 0 && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                      {Math.floor(lec.duration / 60)}m {Math.floor(lec.duration % 60)}s
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
};

export default ManageLecturesPage;
