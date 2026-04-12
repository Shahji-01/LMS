/**
 * Intercepts standard Cloudinary upload URLs and injects
 * transformation parameters to heavily reduce image payload sizes.
 * 
 * @param {string} url - Original Image URL (e.g. from Cloudinary)
 * @param {number} width - Target width in pixels
 * @param {number} height - Target height in pixels (optional)
 * @returns {string} - Optimized URL
 */
export const optimizeImage = (url, width = 400, height = null) => {
    if (!url || typeof url !== "string") return url;
  
    // Only intercept cloudinary urls
    if (!url.includes("res.cloudinary.com")) return url;
  
    // Prevent duplicate transformations
    if (url.includes("/upload/w_") || url.includes("/upload/f_") || url.includes("/upload/q_")) {
      return url;
    }
  
    const transforms = [`w_${width}`, "c_fill", "q_auto", "f_auto"];
    if (height) transforms.push(`h_${height}`);
  
    // Splice in the transformations right after the /upload/ segment
    return url.replace("/upload/", `/upload/${transforms.join(",")}/`);
  };
  
