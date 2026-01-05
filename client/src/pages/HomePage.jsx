import { Link } from "react-router-dom";
import ROUTES  from "../../routes";

// Temporary mock data (replace with API data)
const courses = [
  {
    _id: "1",
    title: "Full Stack Web Development",
    subtitle: "Learn MERN stack from scratch",
    category: "Web Development",
    level: "beginner",
    price: 1999,
    thumbnail:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
    totalDuration: 40,
    totalLectures: 120,
  },
  {
    _id: "2",
    title: "Data Structures & Algorithms",
    subtitle: "Crack interviews with confidence",
    category: "Programming",
    level: "intermediate",
    price: 2499,
    thumbnail:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
    totalDuration: 35,
    totalLectures: 90,
  },
];

const Home = () => {
  return (
    <div className="w-full">

      {/* HERO SECTION */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Learn Skills That Actually Matter
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            High-quality courses taught by industry experts.
            Learn at your own pace and level up your career.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              to={ROUTES.COURSES_PUBLISHED}
              className="px-6 py-3 rounded-xl bg-black text-white font-medium hover:bg-black/90 transition"
            >
              Browse Courses
            </Link>
            <Link
              to={ROUTES.SIGNUP}
              className="px-6 py-3 rounded-xl border border-gray-300 font-medium hover:bg-gray-100 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED COURSES */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold">
              Popular Courses
            </h2>
            <Link
              to={ROUTES.COURSES_PUBLISHED}
              className="text-sm font-medium text-gray-600 hover:text-black"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div
                key={course._id}
                className="rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition"
              >
                {/* Thumbnail */}
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="h-48 w-full object-cover"
                />

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span className="capitalize">{course.level}</span>
                    <span>{course.category}</span>
                  </div>

                  <h3 className="text-lg font-semibold">
                    {course.title}
                  </h3>

                  {course.subtitle && (
                    <p className="text-sm text-gray-600 mt-1">
                      {course.subtitle}
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                    <span>{course.totalLectures} lectures</span>
                    <span>{course.totalDuration} hrs</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-semibold">
                      ₹{course.price}
                    </span>
                    <Link
                      to={`${ROUTES.COURSES_PUBLISHED}/${course._id}`}
                      className="text-sm font-medium text-black hover:underline"
                    >
                      View Course →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
