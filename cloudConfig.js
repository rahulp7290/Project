require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
    // timeout: 60000,
});


const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'accomdation_DEV',
      allowed_formats: ["png","jpg","jpeg"], 
      
    },
  });

module.exports = {
    cloudinary,
    storage,
};

// console.log("Cloudinary config loaded:");
// console.log("Name:", process.env.CLOUD_NAME);
// console.log("Key:", process.env.CLOUD_API_KEY);
// console.log("Secret:", process.env.CLOUD_API_SECRET ? "✅ Present" : "❌ Missing");
