import { z } from "zod";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const envSchema = z.object({
    PORT: z.string().default("8000"),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    // Database
    MONGO_URI: z.string({ required_error: "MONGO_URI is required" }).min(1),

    // JWT
    JWT_SECRET: z.string({ required_error: "JWT_SECRET is required" }).min(1),
    JWT_REFRESH_SECRET: z.string().default("refresh_secret_fallback"),
    JWT_EXPIRES_IN: z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
    JWT_COOKIE_EXPIRES_IN: z.string().default("7"),

    // Client
    CLIENT_URL: z.string().default("http://localhost:5173"),

    // Cloudinary
    CLOUDINARY_CLOUD_NAME: z.string({ required_error: "CLOUDINARY_CLOUD_NAME is required" }).min(1),
    CLOUDINARY_API_KEY: z.string({ required_error: "CLOUDINARY_API_KEY is required" }).min(1),
    CLOUDINARY_API_SECRET: z.string({ required_error: "CLOUDINARY_API_SECRET is required" }).min(1),

    // SMTP
    SMTP_HOST: z.string().default("smtp.gmail.com"),
    SMTP_PORT: z.string().default("587"),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),

    // Stripe
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),

    // Razorpay
    RAZORPAY_KEY_ID: z.string().optional(),
    RAZORPAY_KEY_SECRET: z.string().optional(),

    // Redis
    REDIS_URL: z.string().default("redis://localhost:6379"),

    // Sentry
    SENTRY_DSN: z.string().optional(),

    // Feature flags
    ENABLE_QUEUES: z.string().default("false"),
});

let config;

try {
    config = envSchema.parse(process.env);
} catch (err) {
    if (err instanceof z.ZodError) {
        const missing = err.errors.map((e) => `  ✗ ${e.path.join(".")} — ${e.message}`).join("\n");
        console.error(`\n[CONFIG ERROR] Missing or invalid environment variables:\n${missing}\n`);
        process.exit(1);
    }
    throw err;
}

export default config;
