import { Worker } from "bullmq";
import { getRedisClient, isRedisConnected } from "../config/redis.js";
import { Lecture } from "../models/lecture.model.js";
import { v2 as cloudinary } from "cloudinary";
import logger from "../utils/logger.js";

let videoWorker = null;

export const startVideoWorker = () => {
    if (!isRedisConnected()) {
        logger.warn("[VideoWorker] Redis unavailable — worker not started.");
        return null;
    }

    videoWorker = new Worker(
        "VideoProcessingQueue",
        async (job) => {
            const { lectureId, publicId } = job.data;

            try {
                // Fetch video metadata from Cloudinary
                const result = await cloudinary.api.resource(publicId, { resource_type: "video" });
                const durationSeconds = Math.ceil(result.duration || 0);

                // Update lecture duration
                await Lecture.findByIdAndUpdate(lectureId, { duration: durationSeconds });
                logger.info({ lectureId, durationSeconds }, "[VideoWorker] Updated lecture duration");
            } catch (err) {
                logger.error({ jobId: job.id, err: err.message }, "[VideoWorker] Job error");
                throw err;
            }
        },
        {
            connection: getRedisClient(),
            concurrency: 2,
        }
    );

    videoWorker.on("failed", (job, err) => {
        logger.error({ jobId: job?.id, err: err.message }, "[VideoWorker] Job permanently failed");
    });

    logger.info("[VideoWorker] Started.");
    return videoWorker;
};

export const stopVideoWorker = async () => {
    if (videoWorker) {
        await videoWorker.close();
        videoWorker = null;
        logger.info("[VideoWorker] Stopped.");
    }
};
