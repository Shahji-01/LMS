/**
 * CLI Script — Flush Redis cache keys with lms: prefix
 * Usage: node scripts/clean-cache.js
 */
import dotenv from "dotenv";
import { Redis } from "ioredis";

dotenv.config({ path: "../.env" });

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const run = async () => {
    const client = new Redis(REDIS_URL, { lazyConnect: true });
    try {
        await client.connect();
        console.log("✅ Connected to Redis");

        const keys = await client.keys("lms:*");
        if (keys.length === 0) {
            console.log("ℹ️  No cache keys found (prefix: lms:*)");
        } else {
            await client.del(...keys);
            console.log(`🗑️  Deleted ${keys.length} cache key(s):`);
            keys.forEach((k) => console.log(`   - ${k}`));
        }
    } catch (err) {
        console.error("❌ Redis error:", err.message);
        process.exit(1);
    } finally {
        await client.quit();
        process.exit(0);
    }
};

run();
