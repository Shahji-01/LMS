import { v2 as cloudinary } from "cloudinary";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

// Upload an image or video
const uploadToCloudinary = async (localfilepath) => {
  try {
    const uploadResponse = await cloudinary.uploader.upload(localfilepath, {
      resource_type: "auto",
    });
    console.log("upload response", uploadResponse);
    return uploadResponse;
  } catch (err) {
    console.log(err);
  }
};

const deleteImageFromCloudinary = async (publicId) => {
  try {
    const deleteResponse = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
    console.log("delete response:", deleteResponse);
    return deleteResponse;
  } catch (error) {
    console.log(error);
  }
};

const deleteVideoFromCloudinary = async (publicId) => {
  try {
    const deleteResponse = await cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
    });
    console.log("delete response:", deleteResponse);
    return deleteResponse;
  } catch (error) {
    console.log(error);
  }
};
export {
  deleteImageFromCloudinary,
  deleteVideoFromCloudinary,
  uploadToCloudinary,
};
