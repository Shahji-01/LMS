import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getCourseById, updateCourse } from "../api/services/courseService.js";
import { getCategories } from "../api/services/categoryService.js";
import toast from "react-hot-toast";
import { ImagePlus, X, IndianRupee, Info, ArrowLeft, Loader2, GripVertical, Settings2, FileQuestion } from "lucide-react";
import { motion } from "framer-motion";

const EditCoursePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const fileRef = useRef();

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    category: "",
    level: "beginner",
    price: "",
  });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const [courseRes, catRes] = await Promise.all([
          getCourseById(courseId),
          getCategories().catch(() => ({ data: [] }))
        ]);
        setCategories(catRes.data || catRes);
        
        const c = courseRes?.data?.course || courseRes?.data || courseRes;
        setFormData({
          title: c.title || "",
          subtitle: c.subtitle || "",
          description: c.description || "",
          category: c.category?._id || c.category || "",
          level: c.level || "beginner",
          price: c.price || "",
        });
        if (c.thumbnail) setThumbnailPreview(c.thumbnail);
      } catch {
        toast.error("Failed to load course details.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be smaller than 5MB");
        return;
      }
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveThumbnail = (e) => {
    e.stopPropagation();
    setThumbnailFile(null);
    setThumbnailPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    let toastId = toast.loading("Saving changes...");

    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
      if (thumbnailFile) fd.append("thumbnail", thumbnailFile);

      await updateCourse(courseId, fd);
      toast.success("Course updated successfully!", { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to update course.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-medium">Loading course details...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }}
      className="min-h-screen pt-10 pb-20 px-6 sm:px-8 max-w-5xl mx-auto w-full"
    >
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Link to="/instructor/courses" className="text-sm font-bold text-slate-500 hover:text-blue-600 mb-4 inline-flex items-center gap-1 group transition-colors">
            <ArrowLeft size={16} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-heading font-black text-slate-900 tracking-tight">Edit Course</h1>
          <p className="text-slate-500 mt-2 text-[15px] font-medium">Update course details and manage your content.</p>
        </div>

        <div className="flex gap-3">
          <Link to={`/instructor/course/${courseId}/lectures`} className="h-11 px-5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm flex items-center gap-2">
            <Settings2 size={16} /> Manage Lectures
          </Link>
          <Link to={`/instructor/course/${courseId}/quizzes`} className="h-11 px-5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 font-semibold text-sm hover:bg-indigo-100 hover:border-indigo-300 transition-colors shadow-sm flex items-center gap-2">
            <FileQuestion size={16} /> Manage Quizzes
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8">
          <form id="edit-course-form" onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-10 space-y-8 relative overflow-hidden">
            {/* Soft decorative glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2" />

            <div className="space-y-6 relative z-10">

              {/* Title */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Course Title <span className="text-red-500">*</span></label>
                <input type="text" name="title" maxLength={100} required
                  placeholder="e.g. Master React 19 in 7 Days"
                  value={formData.title} onChange={handleChange}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 font-medium text-slate-900 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Subtitle <span className="text-slate-400 font-medium normal-case ml-1 tracking-normal">(Optional)</span></label>
                <input type="text" name="subtitle" maxLength={200}
                  placeholder="A catchy short description for the course cards"
                  value={formData.subtitle} onChange={handleChange}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 text-slate-700 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Full Course Description <span className="text-red-500">*</span></label>
                <textarea name="description" rows={6} required
                  placeholder="Describe the curriculum, target audience, and what students will learn..."
                  value={formData.description} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all resize-y"
                />
              </div>

              {/* Category & Level Grid */}
              <div className="grid sm:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Category <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select name="category" required
                      value={formData.category} onChange={handleChange}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 font-medium text-slate-900 bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Select a category</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                      <GripVertical size={16} className="text-slate-400" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Difficulty Level <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select name="level" value={formData.level} onChange={handleChange}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 font-medium text-slate-900 bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none appearance-none cursor-pointer"
                    >
                      <option value="beginner">Beginner Friendly</option>
                      <option value="intermediate">Intermediate Level</option>
                      <option value="advanced">Advanced Masters</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                      <GripVertical size={16} className="text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </form>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-6">

          {/* Thumbnail Panel */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-4 block">Course Thumbnail</h3>

            <div
              onClick={() => !thumbnailPreview && fileRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-2xl overflow-hidden transition-all duration-200
                ${thumbnailPreview
                  ? "border-transparent bg-slate-100"
                  : "border-slate-300 bg-slate-50 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer"
                }
              `}
            >
              {thumbnailPreview ? (
                <div className="group relative aspect-video w-full">
                  <img src={thumbnailPreview} alt="preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <button
                      type="button"
                      onClick={handleRemoveThumbnail}
                      className="h-10 px-4 flex items-center gap-2 bg-white/10 hover:bg-red-500 text-white backdrop-blur-md rounded-full font-semibold text-sm transition-colors"
                    >
                      <X size={16} /> Remove/Change
                    </button>
                  </div>
                </div>
              ) : (
                <div className="aspect-video w-full flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                    <ImagePlus size={20} strokeWidth={2.5} />
                  </div>
                  <p className="text-sm font-bold text-slate-700">Click to upload thumbnail</p>
                  <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-widest">16:9 ratio, Max 5MB</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
          </div>

          {/* Pricing Panel */}
          <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-3xl border border-blue-100 shadow-xl shadow-blue-500/5 p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 block">Pricing Strategy</h3>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <IndianRupee size={18} strokeWidth={2.5} />
              </div>
              <input type="number" name="price" min={0} step="any" required form="edit-course-form"
                placeholder="0.00" value={formData.price} onChange={handleChange}
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 text-lg font-bold text-slate-900 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all bg-white"
              />
            </div>
            <p className="text-[13px] font-medium text-slate-500 flex items-start gap-2 leading-relaxed">
              <Info size={16} className="text-blue-500 shrink-0 mt-0.5" strokeWidth={2.5} />
              Updating the price will immediately affect new students.
            </p>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            form="edit-course-form"
            disabled={saving}
            className="btn-primary w-full h-14 text-base shadow-lg shadow-blue-500/25 relative active:scale-[0.98] transition-transform rounded-xl"
          >
            {saving ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin text-white/80" />
                Saving Changes...
              </div>
            ) : "Save All Changes"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/instructor/courses")}
            className="w-full h-14 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors"
          >
            Discard Changes
          </button>

        </div>
      </div>
    </motion.div>
  );
};

export default EditCoursePage;
