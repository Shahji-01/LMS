import { Worker } from "bullmq";
import { getRedisClient, isRedisConnected } from "../config/redis.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { enrollStudentInCourse } from "../services/enrollment.service.js";
import logger from "../utils/logger.js";

let paymentWorker = null;

export const startPaymentWorker = () => {
    if (!isRedisConnected()) {
        logger.warn("[PaymentWorker] Redis unavailable — worker not started.");
        return null;
    }

    paymentWorker = new Worker(
        "PaymentWebhookRetryQueue",
        async (job) => {
            const { provider, event } = job.data;

            if (provider === "stripe" && event.type === "checkout.session.completed") {
                const session = event.data.object;

                const purchase = await CoursePurchase.findOne({ paymentId: session.id });
                if (!purchase) throw new Error("Purchase not found");

                // Idempotency: skip if already completed
                if (purchase.status === "completed") {
                    logger.warn({ jobId: job.id }, "[PaymentWorker] Duplicate job — already completed");
                    return;
                }

                purchase.status = "completed";
                purchase.amount = session.amount_total ? session.amount_total / 100 : purchase.amount;
                await purchase.save();

                // FIX: Use shared enrollment service (no more duplicated enrollment logic)
                await enrollStudentInCourse({
                    userId: purchase.user,
                    courseId: purchase.course,
                    amount: purchase.amount,
                    paymentMethod: "stripe",
                });

                logger.info({ purchaseId: purchase._id }, "[PaymentWorker] Processed payment");
            }
        },
        {
            connection: getRedisClient(),
            concurrency: 3,
        }
    );

    paymentWorker.on("failed", (job, err) => {
        logger.error({ jobId: job?.id, err: err.message }, "[PaymentWorker] Job permanently failed");
    });

    logger.info("[PaymentWorker] Started.");
    return paymentWorker;
};

export const stopPaymentWorker = async () => {
    if (paymentWorker) {
        await paymentWorker.close();
        paymentWorker = null;
        logger.info("[PaymentWorker] Stopped.");
    }
};
