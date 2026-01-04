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

  // Handle thumbnail upload
  if (req.file) {
    const thumbnailLocalPath = req.file?.path;
    const thumbnail = await uploadMedia(thumbnailLocalPath);
    if (!thumbnail.url) {
      throw new AppError(500, "fail to upload thumbnail to the cloud");
    }
  } else {
    throw new AppError(400, "Course thumbnail is required");
  }

  // Create course
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

  // Add course to instructor's created courses
  await User.findByIdAndUpdate(req.id, {
    $push: { createdCourses: course._id },
  });

  return res
    .status(201)
    .json(new AppResponse(200, "course is been created", course));
});

/**
 * Search courses with filters
 * @route GET /api/v1/courses/search
 */
export const searchCourses = catchAsync(async (req, res) => {
  const {
    query = "",
    categories = [],
    level,
    priceRange,
    sortBy = "newest",
  } = req.query;

  // Create search query
  const searchCriteria = {
    isPublished: true,
    $or: [
      { title: { $regex: query, $options: "i" } },
      { subtitle: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ],
  };

  // Apply filters
  if (categories.length > 0) {
    searchCriteria.category = { $in: categories };
  }
  if (level) {
    searchCriteria.level = level;
  }
  if (priceRange) {
    const [min, max] = priceRange.split("-");
    searchCriteria.price = { $gte: min || 0, $lte: max || Infinity };
  }

  // Define sorting
  const sortOptions = {};
  switch (sortBy) {
    case "price-low":
      sortOptions.price = 1;
      break;
    case "price-high":
      sortOptions.price = -1;
      break;
    case "oldest":
      sortOptions.createdAt = 1;
      break;
    default:
      sortOptions.createdAt = -1;
  }

  const courses = await Course.find(searchCriteria)
    .populate({
      path: "instructor",
      select: "name avatar",
    })
    .sort(sortOptions);

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses,
  });
});

/**
 * Get all published courses
 * @route GET /api/v1/courses/published
 */
export const getPublishedCourses = catchAsync(async (req, res) => {
  // TODO: Implement get published courses functionality
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [courses, total] = await Promise.all([
    Course.find({ isPublished: true })
      .populate({
        path: "instructor",
        select: "name avatar",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Course.countDocuments({ isPublished: true }),
  ]);

  res.status(200).json({
    success: true,
    data: courses,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
  return res.json(new AppResponse(200, "All Published Course's", courses));
});

/**
 * Get courses created by the current user
 * @route GET /api/v1/courses/my-courses
 */
export const getMyCreatedCourses = catchAsync(async (req, res) => {
  // TODO: Implement get my created courses functionality
  const courses = await Course.find({ instructor: req.id }).populate({
    path: "enrolledStudents",
    select: "name avatar",
  });

  return res.json(
    new AppResponse(200, "My Course's", {
      count: courses.length,
      data: courses,
    }),
  );
});

/**
 * Update course details
 * @route PATCH /api/v1/courses/:courseId
 */
export const updateCourseDetails = catchAsync(async (req, res) => {
  // TODO: Implement update course details functionality
  const { courseId } = req.params;
  const { title, subtitle, description, category, level, price } = req.body;
  if (!courseId) {
    throw new AppError(400, "courseId is not found or missing in the params");
  }

  const course = await Course.findById(courseId).populate("instructor");
  if (!course) {
    throw new AppError(404, "course not found");
  }
  // Verify ownership
  if (course.instructor._id.toString() !== req.id) {
    throw new AppError(403, "You don't have access to edit");
  }
  // Handle thumbnail delete and upload
  let thumbnail;
  if (req.file) {
    const deleteThubnailCloud = await deleteMediaFromCloudinary(
      course.thumbnail,
    );
    if (!deleteThubnailCloud) {
      throw new AppError(500, "fail to delete thumbnail from the cloud");
    }
    const thumbnailLocalPath = req.file?.path;
    thumbnail = await uploadMedia(thumbnailLocalPath);
    if (!thumbnail.url) {
      throw new AppError(500, "fail to upload thumbnail to the cloud");
    }
  }
  const updateCourse = await Course.findByIdAndUpdate(
    courseId,
    {
      title,
      subtitle,
      description,
      category,
      level,
      price,
      thumbnail: thumbnail.url || "",
    },
    {
      new: true,
      runValidators: true,
    },
  );

  return res.json(
    new AppResponse(200, "Course has been updated", updateCourse),
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
  const course = await Course.findById(courseId)
    .populate({
      path: "instructor",
      select: "name avatar bio",
    })
    .populate({
      path: "lectures",
      select: "title videoUrl duration isPreview order",
    });

  if (!course) {
    throw new AppError(
      404,
      "theres is not such course with the id or it may be deleted",
    );
  }
  return res.json(
    new AppResponse(200, "Course by id details:-", {
      course,
      averageRating: course.averageRating,
    }),
  );
});

/**
 * Add lecture to course
 * @route POST /api/v1/courses/:courseId/lectures
 */
export const addLectureToCourse = catchAsync(async (req, res) => {
  // TODO: Implement add lecture to course functionality
  const { courseId } = req.params;
  const { title, description, isPreview } = req.body;

  if (!courseId) {
    throw new AppError(400, "courseId is not found or missing in the params");
  }

  const course = await Course.findById(courseId).populate("instructor");
  if (!course) {
    throw new AppError(404, "course not found");
  }

  if (course.instructor._id.toString() !== req.id) {
    throw new AppError(403, "You don't have access to edit");
  }

  // Handle video upload
  const videoLocalPath = req.file?.path;
  const video = await uploadMedia(videoLocalPath);
  if (!video.url) {
    throw new AppError(500, "fail to upload thumbnail to the cloud");
  }

  // Create lecture with video details from cloudinary
  const lecture = await Lecture.create({
    publicId: video?.public_id || "",
    title,
    description,
    isPreview,
    order: course.lectures.length + 1,
    videoUrl: video?.url || "",
    duration: video?.duration || 0,
  });

  if (!lecture) {
    throw new AppError(500, "fail to create lecture ");
  }

  // Add lecture to course
  course.lectures.push(lecture._id);
  await course.save();

  return res.json(
    new AppResponse(200, "lecture has been added to the course", updateCourse),
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
  const course = await Course.findById(courseId).populate({
    path: "lectures",
    select: "title description videoUrl duration isPreview order",
    options: { sort: { order: 1 } },
  });
  if (!course) {
    throw new AppError(404, "there is no course exist");
  }

  // Check if user has access to full course content
  const isEnrolled = course.enrolledStudents.includes(req.id);
  const isInstructor = course.instructor.toString() === req.id;

  let lectures = course.lectures;
  if (!isEnrolled && !isInstructor) {
    // Only return preview lectures for non-enrolled users
    lectures = lectures.filter((lecture) => lecture.isPreview);
  }
  // console.log(course.lectures);
  return res.json(
    new AppResponse(200, "Course lectures:-", {
      lectures,
      isEnrolled,
      isInstructor,
    }),
  );
});
