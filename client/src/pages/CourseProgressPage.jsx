import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const CourseProgressPage = () => {
  const { courseId } = useParams();
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { data } = await axios.get(`/api/v1/progress/${courseId}`);
        setProgress(data.lectures || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [courseId]);

  const toggleCompleted = async (lectureId, completed) => {
    try {
      await axios.patch(
        `/api/v1/progress/${courseId}/lectures/${lectureId}`,
        { completed }
      );
      setProgress((prev) =>
        prev.map((lec) =>
          lec._id === lectureId ? { ...lec, completed } : lec
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const completedCount = progress.filter((l) => l.completed).length;
  const totalLectures = progress.length;
  const progressPercent =
    totalLectures === 0
      ? 0
      : Math.round((completedCount / totalLectures) * 100);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-semibold">Course Progress</h2>
          <p className="text-gray-600 mt-2">
            Track your learning and mark lectures as complete
          </p>
        </div>

        {/* Progress Summary */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="font-medium">Overall Progress</p>
            <p className="text-sm text-gray-600">
              {completedCount}/{totalLectures} lectures
            </p>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-black h-3 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-sm text-gray-600 mt-2">
            {progressPercent}% completed
          </p>
        </div>

        {/* Lectures List */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
          {loading ? (
            <p className="p-6 text-gray-600">Loading progress...</p>
          ) : progress.length === 0 ? (
            <p className="p-6 text-gray-600">
              No lectures found for this course.
            </p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {progress.map((lec, index) => (
                <li
                  key={lec._id}
                  className="flex items-center justify-between p-5"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                      {index + 1}.
                    </span>
                    <p
                      className={`font-medium ${
                        lec.completed
                          ? "line-through text-gray-400"
                          : ""
                      }`}
                    >
                      {lec.title}
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={lec.completed}
                    onChange={(e) =>
                      toggleCompleted(lec._id, e.target.checked)
                    }
                    className="h-5 w-5 accent-black cursor-pointer"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
};

export default CourseProgressPage;
