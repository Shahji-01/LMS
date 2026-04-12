import { Worker } from "bullmq";
import { getRedisClient, isRedisConnected } from "../config/redis.js";
import {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendPurchaseReceiptEmail,
    sendCourseCompletionEmail,
} from "../services/email.service.js";
import logger from "../utils/logger.js";

let emailWorker = null;

export const startEmailWorker = () => {
    if (!isRedisConnected()) {
        logger.warn("[EmailWorker] Redis unavailable — worker not started.");
        return null;
    }

    emailWorker = new Worker(
        "EmailQueue",
        async (job) => {
            const { name, data } = job;
            try {
                if (name === "verification") {
                    await sendVerificationEmail(data.user, data.otp);
                } else if (name === "reset") {

                    await sendPasswordResetEmail(data.user, data.url);
                } else if (name === "receipt") {
                    await sendPurchaseReceiptEmail(data.user, data.course, data.amount);
                } else if (name === "completion") {
                    await sendCourseCompletionEmail(data.user, data.course);
                }
                logger.debug({ jobId: job.id, type: name }, "[EmailWorker] Job completed");
            } catch (err) {
                logger.error({ jobId: job.id, err: err.message }, "[EmailWorker] Job failed");
                throw err; // Re-throw to trigger retry
            }
        },
        {
            connection: getRedisClient(),
            concurrency: 5,
        }
    );

    emailWorker.on("failed", (job, err) => {
        logger.error({ jobId: job?.id, err: err.message }, "[EmailWorker] Job permanently failed");
    });

    logger.info("[EmailWorker] Started.");
    return emailWorker;
};

export const stopEmailWorker = async () => {
    if (emailWorker) {
        await emailWorker.close();
        emailWorker = null;
        logger.info("[EmailWorker] Stopped.");
    }
};
