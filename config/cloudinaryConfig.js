const { v2 } = require("cloudinary")
require('dotenv').config();

v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});


const cloudinaryInstance = v2
module.exports = { cloudinaryInstance }
