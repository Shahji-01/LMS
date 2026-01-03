import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import { User } from "../models/user.model.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import { catchAsync } from "../middleware/error.middleware.js";
import { AppError } from "../middleware/error.middleware.js";
import { AppResponse } from "../utils/appResponse.js";
/**
 * Create a new course
 * @route POST /api/v1/courses
 */
export const createNewCourse = catchAsync(async (req, res) => {
  // TODO: Implement create new course functionality
  const { title, subtitle, description, category, level, price } = req.body;

  const thumbnailLocalPath = req.file?.path;
  const thumbnail = await uploadMedia(thumbnailLocalPath);
  if (!thumbnail.url) {
    throw new AppError(500, "fail to upload thumbnail to the cloud");
  }

  const course = await Course.create({
    title,
    subtitle,
    description,
    category,
    level,
    price,
    thumbnail: thumbnail.url || "",
    instructor: req.id,
  });
  const createdCourse = await Course.findById(course._id);
  if (!createdCourse) {
    throw new AppError(500, "Fail to create new course");
  }
  return res.json(
    new AppResponse(200, "course is been created", createdCourse)
  );
});

/**
 * Search courses with filters
 * @route GET /api/v1/courses/search
 */
export const searchCourses = catchAsync(async (req, res) => {
  // TODO: Implement search courses functionality
  const courses = await Course.find({});
  return res.json(new AppResponse(200, "All Course's", courses));
});

/**
 * Get all published courses
 * @route GET /api/v1/courses/published
 */
export const getPublishedCourses = catchAsync(async (req, res) => {
  // TODO: Implement get published courses functionality
  const courses = await Course.find({ isPublished: true });
  return res.json(new AppResponse(200, "All Published Course's", courses));
});

/**
 * Get courses created by the current user
 * @route GET /api/v1/courses/my-courses
 */
export const getMyCreatedCourses = catchAsync(async (req, res) => {
  // TODO: Implement get my created courses functionality
  const courses = await Course.find({ instructor: req.id });

  return res.json(new AppResponse(200, "My Course's", courses));
});

/**
 * Update course details
 * @route PATCH /api/v1/courses/:courseId
 */
export const updateCourseDetails = catchAsync(async (req, res) => {
  // TODO: Implement update course details functionality
  const { courseId } = req.params;
  if (!courseId) {
    throw new AppError(400, "courseId is not found or missing in the params");
  }

  const course = await Course.findById(courseId).populate("instructor");
  if (!course) {
    throw new AppError(404, "course not found");
  }

  if (course.instructor._id.toString() !== req.id) {
    throw new AppError(401, "You don't have access to edit");
  }
  const deleteThubnailCloud = await deleteMediaFromCloudinary(course.thumbnail);
  if (!deleteThubnailCloud) {
    throw new AppError(500, "fail to delete thumbnail from the cloud");
  }
  const thumbnailLocalPath = req.file?.path;
  const thumbnail = await uploadMedia(thumbnailLocalPath);
  if (!thumbnail.url) {
    throw new AppError(500, "fail to upload thumbnail to the cloud");
  }

  const updateCourse = await Course.findByIdAndUpdate(
    courseId,
    {
      thumbnail: thumbnail.url || "",
    },
    {
      new: true,
    }
  );

  return res.json(
    new AppResponse(200, "Course has been updated", updateCourse)
  );
});

/**
 * Get course by ID
 * @route GET /api/v1/courses/:courseId
 */
export const getCourseDetails = catchAsync(async (req, res) => {
  // TODO: Implement get course details functionality
  const { courseId } = req.params;
  if (!courseId) {
    throw new AppError(404, "courseId is missing in params or not found");
  }
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError(
      404,
      "theres is not such course with the id or it may be deleted"
    );
  }
  return res.json(new AppResponse(200, "Course by id details:-", course));
});

/**
 * Add lecture to course
 * @route POST /api/v1/courses/:courseId/lectures
 */
export const addLectureToCourse = catchAsync(async (req, res) => {
  // TODO: Implement add lecture to course functionality
  const { courseId } = req.params;
  const { title, description, order } = req.body;
  if (!courseId) {
    throw new AppError(400, "courseId is not found or missing in the params");
  }

  const course = await Course.findById(courseId).populate("instructor");
  if (!course) {
    throw new AppError(404, "course not found");
  }

  if (course.instructor._id.toString() !== req.id) {
    throw new AppError(401, "You don't have access to edit");
  }
  const videoLocalPath = req.file?.path;
  const video = await uploadMedia(videoLocalPath);
  if (!video.url) {
    throw new AppError(500, "fail to upload thumbnail to the cloud");
  }
  // work to do
  const lecture = await Lecture.create({
    publicId: video.public_id || "",
    title,
    description,
    order,
    videoUrl: video.url || "",
  });

  if (!lecture) {
    throw new AppError(500, "fail to create lecture ");
  }
  const updateCourse = await Course.findByIdAndUpdate(courseId, {
    $push: { lectures: lecture._id },
  });
  return res.json(
    new AppResponse(200, "lecture has been added to the course", updateCourse)
  );
});

/**
 * Get course lectures
 * @route GET /api/v1/courses/:courseId/lectures
 */
export const getCourseLectures = catchAsync(async (req, res) => {
  // TODO: Implement get course lectures functionality
  const { courseId } = req.params;
  if (!courseId) {
    throw new AppError(400, "CourseID is missing in the params");
  }
  const course = await Course.findById(courseId).populate("lectures");
  if (!course) {
    throw new AppError(400, "there is no course exist");
  }
  // console.log(course.lectures);
  return res.json(new AppResponse(200, "Course lectures:-", course.lectures));
});
