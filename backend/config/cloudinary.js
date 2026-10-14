
// const cloudinary = require("cloudinary").v2; (alternate method = No Object destructing)

const { v2: cloudinary } = require("cloudinary");
// Javascript destructing...

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;
