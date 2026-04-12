import { Redis } from "ioredis";
import config from "./env.js";
import logger from "../utils/logger.js";

let redisClient = null;
let isConnected = false;

const createRedisClient = () => {
    const client = new Redis(config.REDIS_URL, {
        lazyConnect: true,
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
            if (times > 3) {
                logger.error("[Redis] Max retries reached. Running without Redis.");
                return null; // Stop retrying
            }
            return Math.min(times * 200, 2000);
        },
    });

    client.on("connect", () => {
        isConnected = true;
        logger.info("[Redis] Connected successfully.");
    });

    client.on("error", (err) => {
        isConnected = false;
        logger.error({ err: err.message }, "[Redis] Connection error. Queues and caching disabled.");
    });

    client.on("close", () => {
        isConnected = false;
    });

    return client;
};

export const getRedisClient = () => {
    if (!redisClient) {
        redisClient = createRedisClient();
    }
    return redisClient;
};

export const connectRedis = async () => {
    try {
        const client = getRedisClient();
        await client.connect();
        return client;
    } catch (err) {
        logger.error({ err: err.message }, "[Redis] Could not connect. Continuing without Redis.");
        return null;
    }
};

export const disconnectRedis = async () => {
    if (redisClient) {
        await redisClient.quit();
        redisClient = null;
        isConnected = false;
        logger.info("[Redis] Disconnected.");
    }
};

export const isRedisConnected = () => isConnected;

export default getRedisClient;
