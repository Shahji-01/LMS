import { Queue } from "bullmq";
import { getRedisClient, isRedisConnected } from "../config/redis.js";

let videoQueue = null;

export const getVideoQueue = () => {
    if (!isRedisConnected()) return null;
    if (!videoQueue) {
        videoQueue = new Queue("VideoProcessingQueue", {
            connection: getRedisClient(),
            defaultJobOptions: {
                attempts: 2,
                backoff: { type: "fixed", delay: 10000 },
                removeOnComplete: 50,
                removeOnFail: 100,
            },
        });
    }
    return videoQueue;
};

/**
 * Enqueue a video processing job (e.g. after upload to extract duration)
 */
export const enqueueVideoProcessing = async (lectureId, publicId) => {
    const queue = getVideoQueue();
    if (!queue) return;
    await queue.add("process-video", { lectureId, publicId }, { jobId: `video-${lectureId}` });
};
