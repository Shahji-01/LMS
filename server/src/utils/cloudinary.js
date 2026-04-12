import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
import logger from "../utils/logger.js";

dotenv.config({});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a local file to Cloudinary (auto resource type detection).
 * Removes the local file after upload succeeds or fails.
 * @param {string} filePath - Local file path
 * @returns {object} - Cloudinary upload response
 */
export const uploadMedia = async (filePath) => {
  let uploadResponse;
  try {
    uploadResponse = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
  } catch (error) {
    logger.error({ err: error.message, filePath }, "[Cloudinary] Upload failed");
    // Clean up local file even on failure
    fs.unlink(filePath, () => {});
    throw error; // Propagate so caller can handle (e.g. don't save Lecture doc)
  }

  // Clean up local file on success
  fs.unlink(filePath, (err) => {
    if (err) logger.warn({ err: err.message }, "[Cloudinary] Failed to delete local temp file");
  });

  return uploadResponse;
};

/**
 * Delete an image from Cloudinary by its public URL.
 * FIX: Added guard against missing /upload/ segment in URL.
 * @param {string} url - Full Cloudinary URL
 */
export const deleteMediaFromCloudinary = async (url) => {
  try {
    if (!url || !url.includes("/upload/")) {
      logger.warn({ url }, "[Cloudinary] Cannot delete — invalid or missing URL");
      return;
    }

    const publicId = url
      .split("/upload/")[1]
      .replace(/^v\d+\//, "")
      .replace(/\.[^/.]+$/, "");

    const response = await cloudinary.uploader.destroy(publicId);
    return response;
  } catch (error) {
    logger.error({ err: error.message, url }, "[Cloudinary] Image delete failed");
  }
};

/**
 * Delete a video from Cloudinary by its public ID.
 * @param {string} publicId - Cloudinary public ID (not URL)
 */
export const deleteVideoFromCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      logger.warn("[Cloudinary] deleteVideoFromCloudinary called with no publicId");
      return;
    }
    await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
  } catch (error) {
    logger.error({ err: error.message, publicId }, "[Cloudinary] Video delete failed");
  }
};
