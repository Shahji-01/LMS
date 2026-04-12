// AppRouter.js
import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ROUTES from "./routes";

// Fallback
import FullPageSkeleton from "./components/FullPageSkeleton";

// Layouts (Loaded eagerly)
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Route guards (Loaded eagerly)
import PrivateRoute from "./components/PrivateRoute";
import InstructorRoute from "./components/InstructorRoute";
import AdminRoute from "./components/AdminRoute";

// Pages (Lazy Loaded)
const HomePage = lazy(() => import("./pages/HomePage"));
const SignInPage = lazy(() => import("./pages/SignInPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const CoursesPage = lazy(() => import("./pages/CoursesPage"));
const CourseDetailsPage = lazy(() => import("./pages/CourseDetailsPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ChangePasswordPage = lazy(() => import("./pages/ChangePasswordPage"));
const MyCoursesPage = lazy(() => import("./pages/MyCoursesPage"));
const CourseProgressPage = lazy(() => import("./pages/CourseProgressPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const CertificatePage = lazy(() => import("./pages/CertificatePage"));
const QuizTakingPage = lazy(() => import("./pages/QuizTakingPage"));
const CreateCoursePage = lazy(() => import("./pages/CreateCoursePage"));
const EditCoursePage = lazy(() => import("./pages/EditCoursePage"));
const AddLecturePage = lazy(() => import("./pages/AddLecturePage"));
const ManageLecturesPage = lazy(() => import("./pages/ManageLecturesPage"));
const InstructorQuizzesPage = lazy(() => import("./pages/InstructorQuizzesPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const PurchasesPage = lazy(() => import("./pages/PurchasesPage"));
const CourseStatusPage = lazy(() => import("./pages/CourseStatusPage"));
const InstructorDashboard = lazy(() => import("./pages/InstructorDashboard"));
const LecturePage = lazy(() => import("./pages/LecturePage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage"));

// Admin Pages (Lazy Loaded)
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ManageUsersPage = lazy(() => import("./pages/ManageUsersPage"));
const ManageCoursesPage = lazy(() => import("./pages/ManageCoursesPage"));
const ManageCategoriesPage = lazy(() => import("./pages/ManageCategoriesPage"));
const ManageCouponsPage = lazy(() => import("./pages/ManageCouponsPage"));
const AdminAnalyticsPage = lazy(() => import("./pages/AdminAnalyticsPage.jsx"));
const InstructorAnalyticsPage = lazy(() => import("./pages/InstructorAnalyticsPage.jsx"));
const InstructorRevenuePage = lazy(() => import("./pages/InstructorRevenuePage.jsx"));

const AppRouter = () => {
  return (
    <Router>
      <Suspense fallback={<FullPageSkeleton />}>
        <Routes>
          {/* Auth Pages (No Navbar) */}
          <Route path="/login" element={<Navigate to="/signin" replace />} />
          <Route path={ROUTES.SIGNIN} element={<SignInPage />} />
          <Route path={ROUTES.SIGNUP} element={<SignUpPage />} />
          <Route
            path={ROUTES.FORGOT_PASSWORD}
            element={<ForgotPasswordPage />}
          />
          <Route
            path={ROUTES.RESET_PASSWORD(":token")}
            element={<ResetPasswordPage />}
          />

          {/* Email Verification */}
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          {/* Public Routes with Navbar/Footer */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path={ROUTES.COURSES_PUBLISHED} element={<CoursesPage />} />
            <Route
              path={ROUTES.COURSE_DETAILS(":courseId")}
              element={<CourseDetailsPage />}
            />
            <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
          </Route>

          {/* Authenticated Routes — requires login */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            <Route path={ROUTES.MY_PROFILE} element={<ProfilePage />} />
            <Route
              path={ROUTES.CHANGE_PASSWORD}
              element={<ChangePasswordPage />}
            />
            <Route path={ROUTES.MY_COURSES} element={<MyCoursesPage />} />
            <Route path={ROUTES.WISHLIST} element={<WishlistPage />} />
            <Route
              path={ROUTES.COURSE_PROGRESS(":courseId")}
              element={<CourseProgressPage />}
            />
            <Route
              path={ROUTES.LECTURE(":courseId", ":lectureId")}
              element={<LecturePage />}
            />
            <Route
              path={ROUTES.QUIZ(":courseId", ":quizId")}
              element={<QuizTakingPage />}
            />
            <Route path={ROUTES.PURCHASES} element={<PurchasesPage />} />
            <Route
              path={ROUTES.COURSE_STATUS(":courseId")}
              element={<CourseStatusPage />}
            />
            <Route
              path={ROUTES.CHECKOUT(":courseId")}
              element={<CheckoutPage />}
            />
            <Route path="/certificate/:courseId" element={<CertificatePage />} />
          </Route>

          {/* Instructor Routes — requires login + instructor role */}
          <Route
            path="/instructor"
            element={
              <InstructorRoute>
                <DashboardLayout />
              </InstructorRoute>
            }
          >
            <Route index element={<InstructorDashboard />} />
            <Route path="analytics" element={<InstructorAnalyticsPage />} />
            <Route path="revenue" element={<InstructorRevenuePage />} />
            <Route path="create-course" element={<CreateCoursePage />} />
            <Route path="course/:courseId/edit" element={<EditCoursePage />} />
            <Route path="course/:courseId/lectures/add" element={<AddLecturePage />} />
            <Route path="course/:courseId/lectures" element={<ManageLecturesPage />} />
            <Route path="course/:courseId/quizzes" element={<InstructorQuizzesPage />} />
          </Route>
          {/* Admin Routes — requires login + admin role */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <DashboardLayout />
              </AdminRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<ManageUsersPage />} />
            <Route path="courses" element={<ManageCoursesPage />} />
            <Route path="categories" element={<ManageCategoriesPage />} />
            <Route path="coupons" element={<ManageCouponsPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
};

export default AppRouter;

