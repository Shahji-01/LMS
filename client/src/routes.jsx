// routes.js
/**
 * Frontend Page Routes
 * Centralized routes for React Router
 */

const ROUTES = {
  // Public Routes
  HOME: "/",
  SIGNUP: "/signup",
  SIGNIN: "/signin",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: (token) => `/reset-password/${token}`,
  COURSES_PUBLISHED: "/courses",
  COURSE_DETAILS: (courseId) => `/courses/${courseId}`,

  // Authenticated Routes
  DASHBOARD: "/dashboard",
  MY_PROFILE: "/dashboard/profile",
  CHANGE_PASSWORD: "/dashboard/profile/change-password",
  MY_COURSES: "/dashboard/my-courses",
  WISHLIST: "/dashboard/wishlist",
  COURSE_PROGRESS: (courseId) => `/dashboard/my-courses/${courseId}/progress`,
  LECTURE: (courseId, lectureId) => `/course-progress/${courseId}/lecture/${lectureId}`,
  CERTIFICATE: (courseId) => `/certificate/${courseId}`,
  QUIZ: (courseId, quizId) => `/course-progress/${courseId}/quiz/${quizId}`,

  // Instructor Routes
  CREATE_COURSE: "/instructor/create-course",
  EDIT_COURSE: (courseId) => `/instructor/course/${courseId}/edit`,
  ADD_LECTURE: (courseId) => `/instructor/course/${courseId}/lectures/add`,
  MANAGE_LECTURES: (courseId) => `/instructor/course/${courseId}/lectures`,

  // Purchase / Payment
  CHECKOUT: (courseId) => `/checkout/${courseId}`,
  PURCHASES: "/dashboard/my-purchases",
  COURSE_STATUS: (courseId) => `/my-purchases/${courseId}`,

  // Fallback
  NOT_FOUND: "*",
};

export default ROUTES;
