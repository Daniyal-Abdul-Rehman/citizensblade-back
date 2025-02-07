// middleware/upload.js

const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const cloudinary = require('../../config/Cloudinary');

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'images';  
    let resourceType = 'image'; 

    if (file.mimetype.startsWith('video')) {
      resourceType = 'video';
      folder = 'videos';  // Video folder in Cloudinary
    }

    return {
      folder: folder,
      resource_type: resourceType,
      public_id: file.originalname.split('.')[0], // File name without extension
    };
  },
});


const upload = multer({ storage });

module.exports = upload;
