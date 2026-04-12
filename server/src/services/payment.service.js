import Stripe from "stripe";
import Razorpay from "razorpay";
import crypto from "crypto";
import config from "../config/env.js";
import { AppError } from "../utils/appError.js";

// Initialize Stripe
const getStripe = () => {
    if (!config.STRIPE_SECRET_KEY) throw new AppError(500, "Stripe is not configured.");
    return new Stripe(config.STRIPE_SECRET_KEY);
};

// Initialize Razorpay
const getRazorpay = () => {
    if (!config.RAZORPAY_KEY_ID || !config.RAZORPAY_KEY_SECRET) {
        throw new AppError(500, "Razorpay is not configured.");
    }
    return new Razorpay({ key_id: config.RAZORPAY_KEY_ID, key_secret: config.RAZORPAY_KEY_SECRET });
};

/**
 * Create a Stripe Checkout Session
 */
export const createStripeSession = async ({ course, userId, idempotencyKey }) => {
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create(
        {
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: course.title,
                            images: course.thumbnail ? [course.thumbnail] : [],
                        },
                        unit_amount: Math.round(course.price * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${config.CLIENT_URL}/course-progress/${course._id}`,
            cancel_url: `${config.CLIENT_URL}/courses/${course._id}`,
            metadata: {
                courseId: course._id.toString(),
                userId: userId.toString(),
            },
        },
        { idempotencyKey }
    );

    return session;
};

/**
 * Verify Stripe webhook signature and return event
 */
export const verifyStripeWebhook = (rawBody, signature) => {
    if (!config.STRIPE_WEBHOOK_SECRET) throw new AppError(500, "Stripe webhook secret not configured.");
    const stripe = getStripe();
    try {
        return stripe.webhooks.constructEvent(rawBody, signature, config.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        throw new AppError(400, `Stripe webhook verification failed: ${err.message}`);
    }
};

/**
 * Create a Razorpay Order
 */
export const createRazorpayOrder = async ({ course, idempotencyKey }) => {
    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
        amount: Math.round(course.price * 100), // paise
        currency: "INR",
        receipt: idempotencyKey?.slice(0, 40) || `order_${Date.now()}`,
        notes: { courseId: course._id.toString() },
    });
    return order;
};

/**
 * Verify Razorpay payment signature
 */
export const verifyRazorpayPayment = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
    if (!config.RAZORPAY_KEY_SECRET) throw new AppError(500, "Razorpay is not configured.");
    const expectedSignature = crypto
        .createHmac("sha256", config.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

    if (expectedSignature !== razorpaySignature) {
        throw new AppError(400, "Invalid Razorpay payment signature.");
    }
    return true;
};
