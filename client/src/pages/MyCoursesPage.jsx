import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPurchasedCourses } from "../api/services/purchaseService";
import { CourseCardSkeleton } from "../components/SkeletonLoader";
import EmptyState from "../components/EmptyState";
import CourseCard from "../components/CourseCard";
import { BookOpen } from "lucide-react";

const MyCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPurchasedCourses()
      .then((d) => setCourses(d?.data || []))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
        <p className="text-sm text-gray-500 mt-1">Courses you've purchased and enrolled in.</p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => <CourseCardSkeleton key={i} />)}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="You haven't purchased any courses. Browse our catalog to get started."
          actionLabel="Browse Courses"
          actionTo="/courses"
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              to={`/course-progress/${course._id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;
