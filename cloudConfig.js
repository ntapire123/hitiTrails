const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");

// Configure Cloudinary client
cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Multer storage adapter for Cloudinary (multer-storage-cloudinary v2.x)
const storage = cloudinaryStorage({
  cloudinary,
  params: {
    folder: "Wanderlust",
    allowed_formats: ["jpeg", "jpg", "png"],
  },
});

module.exports = { cloudinary, storage };
