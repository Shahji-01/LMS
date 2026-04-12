import React, { useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { addLecture } from "../api/services/courseService.js";
import toast from "react-hot-toast";
import { Video, X, ArrowLeft, Info, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const AddLecturePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const fileRef = useRef();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isPreview: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) {
        toast.error("Video file is too large! Maximum allowed is 500MB.");
        return;
      }
      setVideoFile(file);
    }
  };

  const clearVideo = (e) => {
    e.stopPropagation();
    setVideoFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      toast.error("Please upload a video for this lecture.");
      return;
    }

    setLoading(true);
    let toastId = toast.loading("Uploading lecture video... This may take a moment.");

    try {
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("description", formData.description);
      fd.append("isPreview", formData.isPreview);
      fd.append("video", videoFile);

      await addLecture(courseId, fd);

      toast.success("Lecture added successfully!", { id: toastId });
      navigate(`/instructor/course/${courseId}/lectures`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to add lecture.", { id: toastId });
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }}
      className="min-h-screen pt-10 pb-20 px-6 sm:px-8 max-w-5xl mx-auto w-full"
    >
      {/* Header */}
      <div className="mb-8">
        <Link to={`/instructor/course/${courseId}/lectures`} className="text-sm font-bold text-slate-500 hover:text-blue-600 mb-4 inline-flex items-center gap-1 group transition-colors">
          <ArrowLeft size={16} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" /> Back to Curriculum
        </Link>
        <h1 className="text-3xl font-heading font-black text-slate-900 tracking-tight">Add New Lecture</h1>
        <p className="text-slate-500 mt-2 text-[15px] font-medium">Upload your video content and provide learning materials.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-10 items-start">
        {/* Main Form */}
        <div className="lg:col-span-8">
          <form id="add-lecture-form" onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-10 space-y-8 relative overflow-hidden">
            {/* Soft decorative glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2" />

            <div className="space-y-6 relative z-10">
              {/* Title */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Lecture Title <span className="text-red-500">*</span></label>
                <input type="text" name="title" maxLength={100} required
                  value={formData.title} onChange={handleChange}
                  placeholder="e.g. Setting Up Your Development Environment"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 font-medium text-slate-900 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Lecture Notes / Description</label>
                <textarea name="description" rows={6} maxLength={1000}
                  value={formData.description} onChange={handleChange}
                  placeholder="Add summaries, links, or notes that accompany this video..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all resize-y"
                />
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-2 text-right">Markdown supported (optional)</p>
              </div>

              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <label className="flex items-start gap-4 cursor-pointer group">
                  <div className="flex items-center h-6">
                    <input type="checkbox" name="isPreview" checked={formData.isPreview} onChange={handleChange}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 focus:ring-offset-2 transition-colors cursor-pointer"
                    />
                  </div>
                  <div>
                    <span className="text-[15px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Setup as Free Preview</span>
                    <p className="text-[13px] font-medium text-slate-500 mt-1 leading-relaxed">Allow anyone to watch this lecture without purchasing the course. Great for introductions!</p>
                  </div>
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Right Sidebar - Video Upload */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-4 block">Lecture Video <span className="text-red-500">*</span></h3>

            <div
              onClick={() => !videoFile && fileRef.current?.click()}
              className={`
                 relative border-2 border-dashed rounded-2xl overflow-hidden transition-all duration-200 min-h-[160px] flex flex-col items-center justify-center
                 ${videoFile
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-300 bg-slate-50 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer"
                }
               `}
            >
              {videoFile ? (
                <div className="p-6 text-center w-full">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
                    <Video size={20} strokeWidth={2.5} />
                  </div>
                  <p className="text-sm font-bold text-emerald-900 line-clamp-2 leading-snug px-2" title={videoFile.name}>
                    {videoFile.name}
                  </p>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600/70 mt-2">
                    {(videoFile.size / 1024 / 1024).toFixed(1)} MB
                  </p>

                  <button
                    type="button"
                    onClick={clearVideo}
                    className="mt-4 text-xs font-bold uppercase tracking-widest text-rose-600 bg-rose-50 hover:bg-rose-100 px-4 py-2.5 rounded-xl transition-colors inline-flex items-center gap-1.5"
                  >
                    <X size={14} strokeWidth={2.5} /> Remove Video
                  </button>
                </div>
              ) : (
                <div className="p-6 text-center w-full">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
                    <Video size={20} strokeWidth={2.5} />
                  </div>
                  <p className="text-sm font-bold text-slate-700">Select video file</p>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">MP4, WEBM (Max: 500MB)</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />

            <div className="mt-4 flex items-start gap-2 text-[12px] font-medium leading-relaxed text-slate-500 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <Info size={16} className="text-blue-500 shrink-0 mt-0.5" strokeWidth={2.5} />
              <p>Videos are uploaded directly to the server. Please do not close this window during the upload process.</p>
            </div>
          </div>

          <button
            type="submit"
            form="add-lecture-form"
            disabled={loading}
            className="btn-primary w-full h-14 text-base shadow-lg shadow-blue-500/25 relative active:scale-[0.98] transition-transform rounded-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin text-white/80" />
                Uploading...
              </div>
            ) : "Publish Lecture Content"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AddLecturePage;
