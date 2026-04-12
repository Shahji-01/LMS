import express from "express";
import { isAuthenticated, restrictTo } from "../middleware/auth.middleware.js";
import { cacheMiddleware } from "../services/cache.service.js";
import {
  createNewCourse,
  searchCourses,
  getPublishedCourses,
  getMyCreatedCourses,
  updateCourseDetails,
  getCourseDetails,
  addLectureToCourse,
  getCourseLectures,
} from "../controllers/course.controller.js";
import {upload} from "../utils/multer.js";

const router = express.Router();

// Public routes
router.get(
  "/published",
  cacheMiddleware((req) => `courses:published:query=${JSON.stringify(req.query)}`),
  getPublishedCourses
);
router.get("/search", searchCourses);

// Protected routes
router.use(isAuthenticated);

// Course management
router
  .route("/")
  .post(restrictTo("instructor"), upload.single("thumbnail"), createNewCourse)
  .get(restrictTo("instructor"), getMyCreatedCourses);

// Course details and updates
router
  .route("/c/:courseId")
  .get(
    cacheMiddleware((req) => `course:details:${req.params.courseId}`),
    getCourseDetails
  )
  .patch(
    restrictTo("instructor"),
    upload.single("thumbnail"),
    updateCourseDetails
  );

// Lecture management
router
  .route("/c/:courseId/lectures")
  .get(getCourseLectures)
  .post(restrictTo("instructor"), upload.single("video"), addLectureToCourse);

export default router;
