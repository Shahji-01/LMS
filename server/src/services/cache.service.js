import { getRedisClient, isRedisConnected } from "../config/redis.js";

const DEFAULT_TTL = 300; // 5 minutes
const PREFIX = "lms:";

/**
 * Get a cached value by key
 * @param {string} key
 * @returns {Promise<any|null>}
 */
export const cacheGet = async (key) => {
    if (!isRedisConnected()) return null;
    try {
        const value = await getRedisClient().get(`${PREFIX}${key}`);
        return value ? JSON.parse(value) : null;
    } catch {
        return null;
    }
};

/**
 * Set a cached value with optional TTL
 * @param {string} key
 * @param {any} value
 * @param {number} ttl - seconds, defaults to 5 minutes
 */
export const cacheSet = async (key, value, ttl = DEFAULT_TTL) => {
    if (!isRedisConnected()) return;
    try {
        await getRedisClient().setex(`${PREFIX}${key}`, ttl, JSON.stringify(value));
    } catch {
        // Silently fail — caching is non-critical
    }
};

/**
 * Delete a cached key
 * @param {string} key
 */
export const cacheDel = async (key) => {
    if (!isRedisConnected()) return;
    try {
        await getRedisClient().del(`${PREFIX}${key}`);
    } catch {
        // Silently fail
    }
};

/**
 * Invalidate all keys matching a pattern
 * @param {string} pattern - glob pattern e.g. "courses:*"
 */
export const cacheInvalidatePattern = async (pattern) => {
    if (!isRedisConnected()) return;
    try {
        const client = getRedisClient();
        const keys = await client.keys(`${PREFIX}${pattern}`);
        if (keys.length > 0) {
            await client.del(...keys);
        }
    } catch {
        // Silently fail
    }
};

/**
 * Cache middleware factory — caches GET responses
 * @param {string} keyFn - function that receives req and returns cache key
 * @param {number} ttl
 */
export const cacheMiddleware = (keyFn, ttl = DEFAULT_TTL) => {
    return async (req, res, next) => {
        const key = typeof keyFn === "function" ? keyFn(req) : keyFn;
        const cached = await cacheGet(key);
        if (cached) {
            return res.status(200).json(cached);
        }

        // Intercept res.json to cache the response
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            if (res.statusCode === 200) {
                cacheSet(key, body, ttl).catch(() => { });
            }
            return originalJson(body);
        };

        next();
    };
};
