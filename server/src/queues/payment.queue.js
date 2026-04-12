import { Queue } from "bullmq";
import { getRedisClient, isRedisConnected } from "../config/redis.js";

let paymentRetryQueue = null;

export const getPaymentRetryQueue = () => {
    if (!isRedisConnected()) return null;
    if (!paymentRetryQueue) {
        paymentRetryQueue = new Queue("PaymentWebhookRetryQueue", {
            connection: getRedisClient(),
            defaultJobOptions: {
                attempts: 5,
                backoff: { type: "exponential", delay: 5000 },
                removeOnComplete: 50,
                removeOnFail: { count: 200 }, // Dead-letter: keep last 200 failed jobs
            },
        });
    }
    return paymentRetryQueue;
};

/**
 * Enqueue a webhook event for retry processing
 */
export const enqueueWebhookRetry = async (provider, eventPayload) => {
    const queue = getPaymentRetryQueue();
    if (!queue) {
        console.warn("[PaymentQueue] Redis unavailable, cannot enqueue webhook retry.");
        return;
    }
    await queue.add(
        `${provider}-webhook`,
        { provider, event: eventPayload },
        { jobId: `webhook-${provider}-${Date.now()}` }
    );
};
