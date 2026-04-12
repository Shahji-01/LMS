import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import swaggerUi from "swagger-ui-express";

import config from "./config/env.js"; // Zod-validated config — fails fast if missing vars
import { swaggerSpec } from "./config/swagger.js";
import { connectRedis, disconnectRedis } from "./config/redis.js";
import connectDB from "./database/db.js";
import logger from "./utils/logger.js";

// Routes
import mediaRoute from "./routes/media.route.js";
import userRoute from "./routes/user.route.js";
import courseRoute from "./routes/course.route.js";
import purchaseRoute from "./routes/purchaseCourse.route.js";
import healthRoute from "./routes/health.route.js";
import courseProgressRoute from "./routes/courseProgress.route.js";
import razorpayRoute from "./routes/razorpay.route.js";
import adminRoute from "./routes/admin.route.js";
import analyticsRoute from "./routes/analytics.route.js";
import reviewRoute from "./routes/review.route.js";
import wishlistRoute from "./routes/wishlist.route.js";
import discussionRoute from "./routes/discussion.route.js";
import noteRoute from "./routes/note.route.js";
import quizRoute from "./routes/quiz.route.js";
import categoryRoute from "./routes/category.route.js";
import couponRoute from "./routes/coupon.route.js";
import payoutRoute from "./routes/payout.route.js";
import notificationRoute from "./routes/notification.route.js";

// Workers
import { startEmailWorker, stopEmailWorker } from "./workers/email.worker.js";
import { startPaymentWorker, stopPaymentWorker } from "./workers/payment.worker.js";
import { startVideoWorker, stopVideoWorker } from "./workers/video.worker.js";

// Rate limiters
import { generalLimiter, coursesLimiter, checkoutLimiter } from "./middleware/rateLimit.middleware.js";

// Auth
import { isAuthenticated, restrictTo } from "./middleware/auth.middleware.js";

dotenv.config({ path: "./.env" });

// ─── Database ──────────────────────────────────────────────────────────────
await connectDB();
await connectRedis();

// ─── Start Background Workers ───────────────────────────────────────────────
startEmailWorker();
startPaymentWorker();
startVideoWorker();

const app = express();

// ─── Security Middleware ────────────────────────────────────────────────────
app.set("trust proxy", 1); // Enable if behind a reverse proxy (Render, Vercel, Nginx)

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        connectSrc: ["'self'", "https://api.stripe.com", "https://api.razorpay.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", "https://res.cloudinary.com"],
        frameSrc: ["'self'", "https://checkout.stripe.com", "https://api.razorpay.com"],
      },
    },
  })
);
app.use(hpp());


// ─── CORS ───────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: config.CLIENT_URL ? config.CLIENT_URL.split(",") : "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Origin",
      "Accept",
      "Idempotency-Key",
    ],
  })
);

// ─── Stripe Webhook (MUST be before express.json()) ────────────────────────
app.post(
  "/api/v1/purchase/webhook/stripe",
  express.raw({ type: "application/json" }),
  (await import("./controllers/coursePurchase.controller.js")).handleStripeWebhook
);

// ─── Body Parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// ─── HTTP Request Logging (Pino) ─────────────────────────────────────────────
const pinoHttp = (await import("pino-http")).default;
app.use(
  pinoHttp({
    logger,
    autoLogging: { ignore: (req) => req.url === "/health" },
    // Use standard JSON in production, pretty-print (via logger transport) in dev
    customLogLevel: (res, err) => (res.statusCode >= 500 || err ? "error" : "info"),
  })
);


// ─── General Rate Limiting ──────────────────────────────────────────────────
app.use("/api", generalLimiter);

// ─── API Documentation ──────────────────────────────────────────────────────
app.use("/api/docs", isAuthenticated, restrictTo("admin"), swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "LearnHub API Docs",
  customCss: ".swagger-ui .topbar { display: none }",
}));

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", coursesLimiter, courseRoute);
app.use("/api/v1/purchase", checkoutLimiter, purchaseRoute);
app.use("/api/v1/progress", courseProgressRoute);
app.use("/api/v1/razorpay", razorpayRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/analytics", analyticsRoute);
app.use("/api/v1/review", reviewRoute);
app.use("/api/v1/wishlist", wishlistRoute);
app.use("/api/v1/discussion", discussionRoute);
app.use("/api/v1/note", noteRoute);
app.use("/api/v1/quiz", quizRoute);
app.use("/api/v1/category", categoryRoute);
app.use("/api/v1/coupon", couponRoute);
app.use("/api/v1/payout", payoutRoute);
app.use("/api/v1/notification", notificationRoute);
app.use("/health", healthRoute);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: `Route ${req.method} ${req.url} not found.` },
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational ?? false;

  logger.error({
    err,
    req: { method: req.method, url: req.url, ip: req.ip },
  }, err.message);

  if (config.NODE_ENV === "production" && !isOperational) {
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "An internal server error occurred." },
    });
  }

  return res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || "ERROR",
      message: err.message || "Something went wrong.",
      ...(err.errors?.length && { fields: err.errors }),
      ...(config.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
});

// ─── Start Server ──────────────────────────────────────────────────────────────
const server = app.listen(config.PORT, () => {
  logger.info(`🚀 LearnHub server running on port ${config.PORT} [${config.NODE_ENV}]`);
  logger.info(`📖 API docs: http://localhost:${config.PORT}/api/docs`);
  
  // Signal PM2 that the application is ready
  if (process.send) {
    process.send("ready");
  }
});


// ─── Graceful Shutdown ─────────────────────────────────────────────────────────
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info("HTTP server closed.");

    // Stop workers
    await Promise.allSettled([stopEmailWorker(), stopPaymentWorker(), stopVideoWorker()]);

    // Close Redis
    await disconnectRedis();

    // Close MongoDB
    const mongoose = (await import("mongoose")).default;
    await mongoose.connection.close();
    logger.info("MongoDB connection closed.");

    logger.info("Graceful shutdown complete. Goodbye! 👋");
    process.exit(0);
  });

  // Force exit after 30 seconds
  setTimeout(() => {
    logger.error("Graceful shutdown timed out. Force exiting.");
    process.exit(1);
  }, 30000);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled Promise Rejection");
});
process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "Uncaught Exception");
  process.exit(1);
});
