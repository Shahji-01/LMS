import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditCoursePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [course, setCourse] = useState({
    title: "",
    subtitle: "",
    description: "",
    category: "",
    level: "beginner",
    price: "",
    thumbnail: "",
    isPublished: false,
  });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await axios.get(`/api/v1/course/c/${courseId}`);
        setCourse({
          title: data.title || "",
          subtitle: data.subtitle || "",
          description: data.description || "",
          category: data.category || "",
          level: data.level || "beginner",
          price: data.price || "",
          thumbnail: data.thumbnail || "",
          isPublished: data.isPublished || false,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCourse({
      ...course,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.patch(`/api/v1/course/c/${courseId}`, {
        ...course,
        price: Number(course.price),
      });
      alert("Course updated successfully!");
      navigate("/dashboard/courses");
    } catch (err) {
      console.error(err);
      alert("Failed to update course");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading course...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h2 className="text-3xl font-semibold">Edit Course</h2>
          <p className="text-gray-600 mt-2">
            Update course details and manage publishing
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
                required
                maxLength={100}
                value={course.title}
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
                value={course.subtitle}
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
                value={course.description}
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
                  value={course.category}
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
                  value={course.level}
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
                value={course.price}
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
                value={course.thumbnail}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-black/80"
              />
            </div>

            {/* Publish Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isPublished"
                checked={course.isPublished}
                onChange={handleChange}
                className="h-4 w-4 accent-black"
              />
              <span className="text-sm font-medium">
                Publish this course
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl bg-black text-white font-medium
                         hover:bg-black/90 transition disabled:opacity-60"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default EditCoursePage;
