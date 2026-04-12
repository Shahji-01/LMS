import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { getRedisClient, isRedisConnected } from "../config/redis.js";

const createLimiter = (windowMs, max, message) => {
    const options = {
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        message: { success: false, error: { code: "RATE_LIMIT_EXCEEDED", message } },
    };

    // Use Redis store if available for distributed rate limiting
    if (isRedisConnected()) {
        options.store = new RedisStore({
            sendCommand: (...args) => getRedisClient().call(...args),
        });
    }

    return rateLimit(options);
};

/** 5 requests per minute — login, signup */
export const authLimiter = createLimiter(60 * 1000, 5, "Too many authentication attempts. Please try again in a minute.");

/** 3 requests per minute — forgot/reset password */
export const resetLimiter = createLimiter(60 * 1000, 3, "Too many password reset requests. Please try again in a minute.");

/** 60 requests per minute — course browsing */
export const coursesLimiter = createLimiter(60 * 1000, 60, "Too many requests. Please slow down.");

/** 10 requests per minute — checkout */
export const checkoutLimiter = createLimiter(60 * 1000, 10, "Too many checkout attempts. Please try again shortly.");

/** 100 requests per 15 minutes — general API */
export const generalLimiter = createLimiter(15 * 60 * 1000, 100, "Too many requests from this IP. Please try again later.");
