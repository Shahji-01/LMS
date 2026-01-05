// AppRouter.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ROUTES from "./routes";

// Layouts
import MainLayout from "./src/layouts/MainLayout";
import DashboardLayout from "./src/layouts/DashboardLayout";

// Pages
import HomePage from "./src/pages/HomePage";
import SignInPage from "./src/pages/SignInPage";
import SignUpPage from "./src/pages/SignUpPage";
import ForgotPasswordPage from "./src/pages/ForgotPasswordPage";
import ResetPasswordPage from "./src/pages/ResetPasswordPage";
import CoursesPage from "./src/pages/CoursesPage";
import CourseDetailsPage from "./src/pages/CourseDetailsPage";
import DashboardPage from "./src/pages/DashboardPage";
import ProfilePage from "./src/pages/ProfilePage";
import ChangePasswordPage from "./src/pages/ChangePasswordPage";
import MyCoursesPage from "./src/pages/MyCoursesPage";
import CourseProgressPage from "./src/pages/CourseProgressPage";
import CreateCoursePage from "./src/pages/CreateCoursePage";
import EditCoursePage from "./src/pages/EditCoursePage";
import AddLecturePage from "./src/pages/AddLecturePage";
import ManageLecturesPage from "./src/pages/ManageLecturesPage";
import CheckoutPage from "./src/pages/CheckoutPage";
import PurchasesPage from "./src/pages/PurchasesPage";
import CourseStatusPage from "./src/pages/CourseStatusPage";
import NotFoundPage from "./src/pages/NotFoundPage";

// Route guards
import PrivateRoute from "./src/components/PrivateRoute";
import InstructorRoute from "./src/components/InstructorRoute";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
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
          <Route path={ROUTES.COURSES_PUBLISHED} element={<CoursesPage />} />
          <Route
            path={ROUTES.COURSE_DETAILS(":courseId")}
            element={<CourseDetailsPage />}
          />
          <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
        </Route>

        {/* Authenticated Routes */}
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
          <Route
            path={ROUTES.COURSE_PROGRESS(":courseId")}
            element={<CourseProgressPage />}
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
        </Route>

        {/* Instructor Routes */}
        <Route
          path="/instructor"
          element={
            // <InstructorRoute>
            <DashboardLayout />
            // </InstructorRoute>
          }
        >
          <Route path={ROUTES.CREATE_COURSE} element={<CreateCoursePage />} />
          <Route
            path={ROUTES.EDIT_COURSE(":courseId")}
            element={<EditCoursePage />}
          />
          <Route
            path={ROUTES.ADD_LECTURE(":courseId")}
            element={<AddLecturePage />}
          />
          <Route
            path={ROUTES.MANAGE_LECTURES(":courseId")}
            element={<ManageLecturesPage />}
          />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
