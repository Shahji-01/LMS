import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { Coupon } from "../models/coupon.model.js";
import { catchAsync } from "../middleware/error.middleware.js";
import { AppError } from "../utils/appError.js";
import { verifyRazorpayPayment } from "../services/payment.service.js";
import { enrollStudentInCourse } from "../services/enrollment.service.js";
import logger from "../utils/logger.js";
import config from "../config/env.js";
import Razorpay from "razorpay";

// Lazily initialize Razorpay using validated config (not raw process.env)
const getRazorpay = () => {
  if (!config.RAZORPAY_KEY_ID || !config.RAZORPAY_KEY_SECRET) {
    throw new AppError(500, "Razorpay is not configured. Please contact support.");
  }
  return new Razorpay({
    key_id: config.RAZORPAY_KEY_ID,
    key_secret: config.RAZORPAY_KEY_SECRET,
  });
};

/**
 * Create a Razorpay order
 * @route POST /api/v1/razorpay/create-order
 */
export const createRazorpayOrder = catchAsync(async (req, res) => {
  const { courseId, couponCode } = req.body;
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

  // Coupon validation
  let finalPrice = course.price;
  let appliedCoupon = null;

  if (couponCode) {
    appliedCoupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (!appliedCoupon || !appliedCoupon.isActive) {
      throw new AppError(400, "Invalid or inactive coupon code.");
    }
    if (new Date() > new Date(appliedCoupon.expirationDate)) {
      throw new AppError(400, "This coupon has expired.");
    }
    if (appliedCoupon.maxUses > 0 && appliedCoupon.currentUses >= appliedCoupon.maxUses) {
      throw new AppError(400, "This coupon has reached its maximum usage limit.");
    }

    const discountAmount = (course.price * appliedCoupon.discountPercentage) / 100;
    finalPrice = Math.max(0, course.price - discountAmount);
  }

  const razorpay = getRazorpay();
  const options = {
    amount: Math.round(finalPrice * 100), // convert to paise
    currency: "INR",
    receipt: `course_${courseId}_${Date.now()}`.slice(0, 40),
    notes: {
      courseId: courseId.toString(),
      userId: userId.toString(),
      couponCode: appliedCoupon ? appliedCoupon.code : "",
    },
  };

  const order = await razorpay.orders.create(options);

  await CoursePurchase.create({
    course: courseId,
    user: userId,
    originalAmount: course.price,
    amount: finalPrice,
    couponCode: appliedCoupon ? appliedCoupon.code : undefined,
    status: "pending",
    paymentMethod: "razorpay",
    paymentId: order.id,
  });

  logger.info({ courseId, userId, orderId: order.id }, "[Razorpay] Order created");

  return res.status(200).json({
    success: true,
    data: {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      course: {
        name: course.title,
        description: course.description,
        image: course.thumbnail,
      },
    },
  });
});

/**
 * Verify Razorpay payment, enroll student, send receipt
 * @route POST /api/v1/razorpay/verify-payment
 */
export const verifyPayment = catchAsync(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // FIX: Use payment.service verifyRazorpayPayment (uses config.RAZORPAY_KEY_SECRET, not process.env)
  verifyRazorpayPayment({
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
  });

  // Retrieve and update the pending purchase record
  const purchase = await CoursePurchase.findOne({ paymentId: razorpay_order_id });
  if (!purchase) {
    throw new AppError(404, "Purchase record not found.");
  }

  // Idempotency: skip if already completed
  if (purchase.status === "completed") {
    logger.warn({ orderId: razorpay_order_id }, "[Razorpay] Duplicate verify-payment call — already completed");
    return res.status(200).json({
      success: true,
      message: "Payment already verified. You are enrolled!",
      courseId: purchase.course,
    });
  }

  purchase.status = "completed";
  purchase.paymentId = razorpay_payment_id; // store final payment ID (not order ID)
  await purchase.save();

  // Increment coupon usage count atomically with condition
  if (purchase.couponCode) {
    await Coupon.updateOne(
      { 
        code: purchase.couponCode,
        $expr: {
          $or: [
            { $eq: ["$maxUses", 0] },
            { $lt: ["$currentUses", "$maxUses"] }
          ]
        }
      },
      { $inc: { currentUses: 1 } }
    );
  }

  // FIX: Use shared enrollment service (no more duplicated logic)
  await enrollStudentInCourse({
    userId: purchase.user,
    courseId: purchase.course,
    amount: purchase.amount,
    paymentMethod: "razorpay",
  });

  logger.info({ purchaseId: purchase._id, userId: purchase.user }, "[Razorpay] Payment verified and student enrolled");

  return res.status(200).json({
    success: true,
    message: "Payment verified. You are now enrolled!",
    courseId: purchase.course,
  });
});
