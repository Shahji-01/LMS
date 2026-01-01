import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import logger from "./utils/logger.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import connectDB from "./database/db.js";
import hpp from "hpp";
// Load environment variables
dotenv.config({
  path: "./.env",
});

// Connect to database
await connectDB();

const app = express();
const port = process.env.PORT || 8000;

// Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  message: "Too many requests from this IP, please try again later.",
});

// Security Middleware
app.use(helmet()); // that helps secure your app by setting various HTTP headers.
// app.use(mongoSanitize()); // Data sanitization against NoSQL query injection
// app.use(xss()); // Data sanitization against XSS
app.use(hpp()); // hpp stands for HTTP Parameter Pollution. // protect against HTTP Parameter Pollution attacks
app.use("/api", limiter); // Apply rate limiting to all routes statring with /api

// Logging Middleware
if (process.env.NODE_ENV === "development") {
  const morganFormat = ":method :url :status :response-time ms";
  app.use(
    morgan(morganFormat, {
      stream: {
        //Morgan can log anywhere you want using a stream
        write: (message) => {
          // write is a function that receives the log as a string
          const logObject = {
            method: message.split(" ")[0],
            url: message.split(" ")[1],
            status: message.split(" ")[2],
            responseTime: message.split(" ")[3],
          };
          logger.info(JSON.stringify(logObject));
        },
      },
    }),
  );
}

// express body parser middleware
app.use(express.json({ limit: "10kb" })); // for parsing the req.body
app.use(express.urlencoded({ extended: true, limit: "10kb" })); // for parsing the url encoded data like @ which is %40.
app.use(express.static("public")); // this is for serving static file
app.use(cookieParser()); // parses cookies sent by the client.
//Without it, you’d have to manually split and decode cookies from req.headers.cookie

// CORS Configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",")
  : ["http://localhost:5173"], // split if array is given
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "device-remember-token",
      "Access-Control-Allow-Origin",
      "Origin",
      "Accept",
    ],
  }),
);

// Api Routes

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// Global Error Handler.
app.use((err, req, res, next) => {
  console.error(err);
  return res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start Server
app.listen(port, () => {
  console.log(
    ` Server running on port ${port} in ${process.env.NODE_ENV} mode`,
  );
});
