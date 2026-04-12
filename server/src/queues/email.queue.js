import { Queue } from "bullmq";
import { getRedisClient, isRedisConnected } from "../config/redis.js";

let emailQueue = null;

export const getEmailQueue = () => {
    if (!isRedisConnected()) return null;
    if (!emailQueue) {
        emailQueue = new Queue("EmailQueue", {
            connection: getRedisClient(),
            defaultJobOptions: {
                attempts: 5,
                backoff: { type: "exponential", delay: 3000 },
                removeOnComplete: 100,

                removeOnFail: 50,
            },
        });
    }
    return emailQueue;
};

/**
 * Enqueue an email job
 * @param {'verification'|'reset'|'receipt'|'completion'} type
 * @param {object} payload
 */
export const enqueueEmail = async (type, payload) => {
    const queue = getEmailQueue();
    if (!queue) {
        // Fallback: import and call directly if Redis unavailable
        const { sendVerificationEmail, sendPasswordResetEmail, sendPurchaseReceiptEmail, sendCourseCompletionEmail } =
            await import("../services/email.service.js");
        try {
            if (type === "verification") await sendVerificationEmail(payload.user, payload.otp);
            else if (type === "reset") await sendPasswordResetEmail(payload.user, payload.url);

            else if (type === "receipt") await sendPurchaseReceiptEmail(payload.user, payload.course, payload.amount);
            else if (type === "completion") await sendCourseCompletionEmail(payload.user, payload.course);
        } catch (err) {
            console.warn("[Email] Direct send failed:", err.message);
        }
        return;
    }
    await queue.add(type, payload, { jobId: `${type}-${Date.now()}-${Math.random()}` });
};
