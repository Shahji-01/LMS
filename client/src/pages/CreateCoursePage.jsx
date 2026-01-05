import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateCoursePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    category: "",
    level: "beginner",
    price: "",
    thumbnail: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/v1/course", {
        ...formData,
        price: Number(formData.price),
      });
      alert("Course created successfully!");
      navigate("/dashboard/courses");
    } catch (err) {
      console.error(err);
      alert("Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h2 className="text-3xl font-semibold">Create New Course</h2>
          <p className="text-gray-600 mt-2">
            Fill in the details below to create your course
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Course Title *
              </label>
              <input
                type="text"
                name="title"
                maxLength={100}
                required
                placeholder="e.g. Full Stack Web Development"
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-black/80"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Subtitle
              </label>
              <input
                type="text"
                name="subtitle"
                maxLength={200}
                placeholder="Short description shown on course cards"
                value={formData.subtitle}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-black/80"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Course Description
              </label>
              <textarea
                name="description"
                rows={5}
                placeholder="Describe what students will learn in this course"
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-black/80"
              />
            </div>

            {/* Category + Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category *
                </label>
                <input
                  type="text"
                  name="category"
                  required
                  placeholder="e.g. Web Development"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-black/80"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Level
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-black/80"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                min={0}
                required
                placeholder="e.g. 1999"
                value={formData.price}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-black/80"
              />
            </div>

            {/* Thumbnail */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Thumbnail URL *
              </label>
              <input
                type="text"
                name="thumbnail"
                required
                placeholder="https://image-url.com/thumbnail.jpg"
                value={formData.thumbnail}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-black/80"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-black text-white font-medium
                         hover:bg-black/90 transition disabled:opacity-60"
            >
              {loading ? "Creating Course..." : "Create Course"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default CreateCoursePage;
