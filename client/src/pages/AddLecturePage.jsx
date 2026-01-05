import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const AddLecturePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [lecture, setLecture] = useState({
    title: "",
    description: "",
    videoUrl: "",
    duration: "",
    publicId: "",
    isPreview: false,
    order: "",
    status: "draft",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLecture({
      ...lecture,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`/api/v1/course/c/${courseId}/lectures`, {
        ...lecture,
        duration: Number(lecture.duration),
        order: Number(lecture.order),
      });

      alert("Lecture added successfully!");
      navigate(`/dashboard/courses/${courseId}/lectures`);
    } catch (err) {
      console.error(err);
      alert("Failed to add lecture");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h2 className="text-3xl font-semibold">Add New Lecture</h2>
          <p className="text-gray-600 mt-2">
            Create and configure a lecture for this course
          </p>
        </div>

        {/* Form */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Lecture Title *
              </label>
              <input
                type="text"
                name="title"
                maxLength={100}
                required
                value={lecture.title}
                onChange={handleChange}
                placeholder="e.g. Introduction to React"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-black/80"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Lecture Description
              </label>
              <textarea
                name="description"
                rows={4}
                maxLength={500}
                value={lecture.description}
                onChange={handleChange}
                placeholder="Explain what this lecture covers"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-black/80"
              />
            </div>

            {/* Video URL */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Video URL *
              </label>
              <input
                type="text"
                name="videoUrl"
                required
                value={lecture.videoUrl}
                onChange={handleChange}
                placeholder="https://cdn.example.com/video.mp4"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-black/80"
              />
            </div>

            {/* Public ID */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Video Public ID *
              </label>
              <input
                type="text"
                name="publicId"
                required
                value={lecture.publicId}
                onChange={handleChange}
                placeholder="cloudinary_public_id"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-black/80"
              />
            </div>

            {/* Duration + Order */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  name="duration"
                  min={0}
                  value={lecture.duration}
                  onChange={handleChange}
                  placeholder="e.g. 12"
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-black/80"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Lecture Order *
                </label>
                <input
                  type="number"
                  name="order"
                  required
                  min={1}
                  value={lecture.order}
                  onChange={handleChange}
                  placeholder="e.g. 1"
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-black/80"
                />
              </div>
            </div>

            {/* Preview + Status */}
            <div className="flex flex-col sm:flex-row gap-6">
              <label className="flex items-center gap-3 text-sm font-medium">
                <input
                  type="checkbox"
                  name="isPreview"
                  checked={lecture.isPreview}
                  onChange={handleChange}
                  className="h-4 w-4 accent-black"
                />
                Free Preview Lecture
              </label>

              <select
                name="status"
                value={lecture.status}
                onChange={handleChange}
                className="w-full sm:w-40 rounded-xl border border-gray-300 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-black/80"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-black text-white font-medium
                         hover:bg-black/90 transition disabled:opacity-60"
            >
              {loading ? "Adding Lecture..." : "Add Lecture"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default AddLecturePage;
