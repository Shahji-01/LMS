import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import { User } from "../models/user.model.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import { catchAsync } from "../middleware/error.middleware.js";
import { AppError } from "../utils/appError.js";
import { AppResponse } from "../utils/appResponse.js";
import { paginateCursor } from "../utils/paginate.js";
import { recordCourseView } from "../services/analytics.service.js";
import { enqueueVideoProcessing } from "../queues/video.queue.js";

/**
 * Create a new course
 * @route POST /api/v1/course/
 */
export const createNewCourse = catchAsync(async (req, res) => {
  const { title, subtitle, description, category, level, price } = req.body;

  if (!title || !category || !price) {
    throw new AppError(400, "Title, category, and price are required.");
  }

  // Handle thumbnail upload
  if (!req.file) {
    throw new AppError(400, "Course thumbnail is required.");
  }

  const thumbnailResult = await uploadMedia(req.file.path);
  if (thumbnailResult?.error || !thumbnailResult?.url) {
    throw new AppError(500, `Failed to upload thumbnail to cloud storage: ${thumbnailResult?.error || 'Unknown cause'}`);
  }

  const course = await Course.create({
    title,
    subtitle,
    description,
    category,
    level: level || "beginner",
    price: Number(price),
    thumbnail: thumbnailResult.url, // FIX: was referencing undefined `thumbnail`
    instructor: req.id,
  });

  await User.findByIdAndUpdate(req.id, {
    $push: { createdCourses: course._id },
  });

  return res
    .status(201)
    .json(new AppResponse(201, "Course created successfully.", course));
});

/**
 * Search courses with filters
 * @route GET /api/v1/course/search
 */
export const searchCourses = catchAsync(async (req, res) => {
  const {
    query = "",
    categories = [],
    level,
    priceRange,
    sortBy = "newest",
    cursor,
    limit = 12,
  } = req.query;

  const searchCriteria = { isPublished: true, isDeleted: { $ne: true } };

  // Use MongoDB Atlas text index when query provided
  if (query.trim()) {
    searchCriteria.$text = { $search: query.trim() };
  }

  if (Array.isArray(categories) && categories.length > 0) {
    searchCriteria.category = { $in: categories };
  } else if (typeof categories === "string" && categories) {
    searchCriteria.category = categories;
  }

  if (level) searchCriteria.level = level;

  if (priceRange) {
    const [min, max] = priceRange.split("-").map(Number);
    searchCriteria.price = { $gte: min || 0, $lte: max || 999999 };
  }

  // For text search — sort by relevance score; otherwise by sortBy
  let sortOptions = { createdAt: -1 };
  if (query.trim()) {
    sortOptions = { score: { $meta: "textScore" }, createdAt: -1 };
  } else {
    switch (sortBy) {
      case "price-low": sortOptions = { price: 1 }; break;
      case "price-high": sortOptions = { price: -1 }; break;
      case "oldest": sortOptions = { createdAt: 1 }; break;
      default: sortOptions = { createdAt: -1 };
    }
  }

  let offset = 0;
  if (cursor) {
    try {
      const decoded = JSON.parse(Buffer.from(cursor, "base64").toString("utf-8"));
      if (decoded.offset !== undefined) {
        offset = parseInt(decoded.offset, 10);
      }
    } catch { }
  }

  let dbQuery = Course.find(searchCriteria)
    .populate({ path: "instructor", select: "name avatar" })
    .populate({ path: "category", select: "name slug" })
    .sort(sortOptions)
    .skip(offset)
    .limit(parseInt(limit) + 1);

  if (query.trim()) {
    dbQuery = dbQuery.select({ score: { $meta: "textScore" } });
  }

  const docs = await dbQuery;
  let nextCursor = null;
  if (docs.length > parseInt(limit)) {
    docs.pop();
    nextCursor = Buffer.from(JSON.stringify({ offset: offset + parseInt(limit) })).toString("base64");
  }

  return res.status(200).json({
    success: true,
    count: docs.length,
    data: docs,
    nextCursor,
  });
});

/**
 * Get all published courses (paginated)
 * @route GET /api/v1/course/published
 */
export const getPublishedCourses = catchAsync(async (req, res) => {
  const { cursor, limit = 12, category, level } = req.query;
  const filter = { isPublished: true, isDeleted: { $ne: true } };
  if (category) filter.category = category;
  if (level) filter.level = level;

  const result = await paginateCursor(Course, filter, {
    cursor,
    limit: parseInt(limit),
    sort: { createdAt: -1 },
    populate: [
      { path: "instructor", select: "name avatar" },
      { path: "category", select: "name slug" }
    ],
  });

  return res.status(200).json(new AppResponse(200, "Published courses retrieved.", result));
});


/**
 * Get courses created by the current instructor
 * @route GET /api/v1/course/
 */
export const getMyCreatedCourses = catchAsync(async (req, res) => {
  const courses = await Course.find({ instructor: req.id, isDeleted: { $ne: true } }).populate({
    path: "enrolledStudents",
    select: "name avatar",
  });

  return res.status(200).json(new AppResponse(200, "My courses", courses));
});

/**
 * Update course details
 * @route PATCH /api/v1/course/c/:courseId
 */
export const updateCourseDetails = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const { title, subtitle, description, category, level, price, isPublished } = req.body;

  if (!courseId) {
    throw new AppError(400, "Course ID is required.");
  }

  const course = await Course.findById(courseId).populate("instructor");
  if (!course) {
    throw new AppError(404, "Course not found.");
  }

  if (course.instructor._id.toString() !== req.id) {
    throw new AppError(403, "You are not authorized to edit this course.");
  }

  const updateData = {};
  if (title) updateData.title = title;
  if (subtitle !== undefined) updateData.subtitle = subtitle;
  if (description !== undefined) updateData.description = description;
  if (category) updateData.category = category;
  if (level) updateData.level = level;
  if (price !== undefined) updateData.price = Number(price);
  if (isPublished !== undefined) updateData.isPublished = isPublished === "true" || isPublished === true;

  // Handle thumbnail update
  if (req.file) {
    if (course.thumbnail) {
      await deleteMediaFromCloudinary(course.thumbnail).catch(() => { });
    }
    const thumbnailResult = await uploadMedia(req.file.path);
    if (!thumbnailResult?.url) {
      throw new AppError(500, "Failed to upload thumbnail.");
    }
    updateData.thumbnail = thumbnailResult.url; // FIX: only set when file uploaded
  }

  const updatedCourse = await Course.findByIdAndUpdate(courseId, updateData, {
    new: true,
    runValidators: true,
  });

  return res
    .status(200)
    .json(new AppResponse(200, "Course updated successfully.", updatedCourse));
});

/**
 * Get course by ID
 * @route GET /api/v1/course/c/:courseId
 */
export const getCourseDetails = catchAsync(async (req, res) => {
  const { courseId } = req.params;

  if (!courseId) {
    throw new AppError(400, "Course ID is required.");
  }

  const course = await Course.findOne({ _id: courseId, isDeleted: { $ne: true } })
    .populate({ path: "instructor", select: "name avatar bio" })
    .populate({ path: "category", select: "name slug" })
    .populate({
      path: "lectures",
      select: "title videoUrl duration isPreview order",
    });

  if (!course) {
    throw new AppError(404, "Course not found.");
  }

  // Record course view for analytics (background — don't block response)
  recordCourseView(courseId, course.instructor._id).catch(() => { });

  return res.status(200).json(
    new AppResponse(200, "Course details", { course })
  );
});

/**
 * Add a lecture to a course
 * @route POST /api/v1/course/c/:courseId/lectures
 */
export const addLectureToCourse = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const { title, description, isPreview } = req.body;

  if (!courseId) {
    throw new AppError(400, "Course ID is required.");
  }

  const course = await Course.findById(courseId).populate("instructor");
  if (!course) {
    throw new AppError(404, "Course not found.");
  }

  if (course.instructor._id.toString() !== req.id) {
    throw new AppError(403, "You are not authorized to add lectures to this course.");
  }

  if (!req.file) {
    throw new AppError(400, "Lecture video is required.");
  }

  const videoResult = await uploadMedia(req.file.path);
  if (!videoResult?.url) {
    throw new AppError(500, "Failed to upload video to cloud storage.");
  }

  const lecture = await Lecture.create({
    title,
    description,
    isPreview: isPreview === "true" || isPreview === true,
    order: course.lectures.length + 1,
    videoUrl: videoResult.url,
    publicId: videoResult.public_id || "",
    duration: videoResult.duration || 0,
  });

  if (!lecture) {
    throw new AppError(500, "Failed to create lecture.");
  }

  course.lectures.push(lecture._id);
  await course.save();

  // Enqueue duration processing and Cloudinary webhook updates
  if (videoResult.public_id) {
    await enqueueVideoProcessing(lecture._id, videoResult.public_id).catch(() => { });
  }

  // FIX: was returning undefined `updateCourse` — now returning the actual lecture
  return res
    .status(201)
    .json(new AppResponse(201, "Lecture added to course.", lecture));
});

/**
 * Get lectures for a course
 * @route GET /api/v1/course/c/:courseId/lectures
 */
export const getCourseLectures = catchAsync(async (req, res) => {
  const { courseId } = req.params;

  if (!courseId) {
    throw new AppError(400, "Course ID is required.");
  }

  const course = await Course.findById(courseId).populate({
    path: "lectures",
    options: { sort: { order: 1 } },
  });

  if (!course) {
    throw new AppError(404, "Course not found.");
  }

  // Determine access level
  const userId = req.id;
  const isEnrolled = userId && course.enrolledStudents.map(String).includes(String(userId));
  const isInstructor = userId && course.instructor.toString() === String(userId);

  let lectures = course.lectures;
  if (!isEnrolled && !isInstructor) {
    lectures = lectures.filter((lec) => lec.isPreview);
  }

  return res.status(200).json(
    new AppResponse(200, "Course lectures", { lectures, isEnrolled, isInstructor })
  );
});
