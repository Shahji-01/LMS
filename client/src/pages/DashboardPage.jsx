import React from "react";

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h2 className="text-3xl font-semibold">
            Dashboard
          </h2>
          <p className="text-gray-600 mt-2">
            Welcome back! Track your courses and progress here.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Enrolled Courses", value: 3 },
            { label: "Completed Courses", value: 1 },
            { label: "In Progress", value: 2 },
            { label: "Certificates", value: 1 },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
            >
              <p className="text-sm text-gray-600">{stat.label}</p>
              <h3 className="text-2xl font-semibold mt-2">
                {stat.value}
              </h3>
            </div>
          ))}
        </div>

        {/* My Courses */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">
            My Courses
          </h3>

          <div className="space-y-4">
            {[
              {
                title: "Full Stack Web Development",
                progress: 65,
              },
              {
                title: "Data Structures & Algorithms",
                progress: 30,
              },
            ].map((course, index) => (
              <div
                key={index}
                className="flex items-center justify-between border border-gray-100 rounded-xl p-4"
              >
                <div>
                  <p className="font-medium">{course.title}</p>
                  <p className="text-sm text-gray-600">
                    {course.progress}% completed
                  </p>
                </div>

                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-black h-2 rounded-full"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
