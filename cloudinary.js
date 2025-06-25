const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,    // Your Cloudinary cloud name
  api_key: process.env.CLOUDINARY_API_KEY,          // Your Cloudinary API key
  api_secret: process.env.CLOUDINARY_API_SECRET      // Your Cloudinary API secret
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'paintings',  // The name of the folder in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],  // Allowed image formats
    transformation: [{ width: 800, height: 600, crop: 'limit' }, // Resize transformation
                    { quality: 'auto', fetch_format: 'auto' } // compression and format transformation
    ] 
  },
});

module.exports = {
  cloudinary,
  upload: multer({storage})
};