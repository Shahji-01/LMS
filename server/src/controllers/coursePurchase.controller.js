import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { catchAsync } from "../middleware/error.middleware.js";
import { AppError } from "../utils/appError.js";
import { createStripeSession, verifyStripeWebhook } from "../services/payment.service.js";
import { enrollStudentInCourse } from "../services/enrollment.service.js";
import { recordRevenue } from "../services/analytics.service.js";
import logger from "../utils/logger.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Create a Stripe checkout session for course purchase
 * @route POST /api/v1/purchase/checkout/stripe
 */
export const initiateStripeCheckout = catchAsync(async (req, res) => {
  const { courseId } = req.body;
  const userId = req.id;

  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError(404, "Course not found.");
  }

  // Prevent duplicate purchases
  const alreadyPurchased = await CoursePurchase.exists({
    user: userId,
    course: courseId,
    status: "completed",
  });
  if (alreadyPurchased) {
    throw new AppError(400, "You have already purchased this course.");
  }

  // Generate idempotency key to prevent double charges
  const idempotencyKey = uuidv4();

  // Use payment service (uses config, not process.env)
  const session = await createStripeSession({ course, userId, idempotencyKey });

  if (!session.url) {
    throw new AppError(400, "Failed to create Stripe checkout session.");
  }

  await CoursePurchase.create({
    course: courseId,
    user: userId,
    amount: course.price,
    originalAmount: course.price,
    status: "pending",
    paymentMethod: "stripe",
    paymentId: session.id,
    idempotencyKey,
  });

  logger.info({ courseId, userId, sessionId: session.id }, "[Stripe] Checkout session created");

  return res.status(200).json({
    success: true,
    data: { checkoutUrl: session.url },
  });
});

/**
 * Handle Stripe webhook — confirms payment and enrolls student
 * @route POST /api/v1/purchase/webhook/stripe
 */
export const handleStripeWebhook = catchAsync(async (req, res) => {
  const sig = req.headers["stripe-signature"];

  // FIX: use verifyStripeWebhook from payment.service (uses config.STRIPE_WEBHOOK_SECRET)
  const event = verifyStripeWebhook(req.body, sig);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const purchase = await CoursePurchase.findOne({ paymentId: session.id }).populate("course");

    if (!purchase) {
      logger.warn({ sessionId: session.id }, "[Stripe] Webhook: purchase record not found");
      // Return 200 to prevent Stripe from retrying indefinitely
      return res.status(200).json({ received: true });
    }

    // Idempotency guard
    if (purchase.status === "completed") {
      logger.warn({ sessionId: session.id }, "[Stripe] Webhook: duplicate event — already completed");
      return res.status(200).json({ received: true });
    }

    purchase.amount = session.amount_total ? session.amount_total / 100 : purchase.amount;
    purchase.status = "completed";
    await purchase.save();

    // FIX: Use shared enrollment service (single source of truth)
    await enrollStudentInCourse({
      userId: purchase.user,
      courseId: purchase.course,
      amount: purchase.amount,
      paymentMethod: "stripe",
    });

    // Record revenue for analytics (background)
    recordRevenue(purchase.course._id, purchase.course.instructor, purchase.amount).catch(() => {});

    logger.info({ purchaseId: purchase._id, userId: purchase.user }, "[Stripe] Webhook: student enrolled");
  }

  return res.status(200).json({ received: true });
});

/**
 * Get purchase status for a course
 * @route GET /api/v1/purchase/status/:courseId
 */
export const getCoursePurchaseStatus = catchAsync(async (req, res) => {
  const { courseId } = req.params;

  const course = await Course.findById(courseId)
    .populate("instructor", "name avatar")
    .populate("lectures", "title videoUrl duration isPreview");

  if (!course) {
    throw new AppError(404, "Course not found.");
  }

  const purchase = await CoursePurchase.findOne({
    user: req.id,
    course: courseId,
  }).sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    data: {
      course,
      isPurchased: purchase?.status === "completed",
      status: purchase?.status || null,
    },
  });
});

/**
 * Get all purchased/enrolled courses for current user
 * @route GET /api/v1/purchase/my-courses
 */
export const getPurchasedCourses = catchAsync(async (req, res) => {
  const purchases = await CoursePurchase.find({
    user: req.id,
    status: "completed",
  }).populate({
    path: "course",
    select: "title thumbnail description category level instructor",
    populate: {
      path: "instructor",
      select: "name avatar",
    },
  });

  const courses = purchases.map((p) => p.course).filter(Boolean);

  return res.status(200).json({
    success: true,
    data: courses,
  });
});
