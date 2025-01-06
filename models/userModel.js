const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minLength: 6,
        maxlength: 320,
        trim: true
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 10,
        maxlength: 15,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        trim: true,
    },
    profilePicture: {
        type: String,
        trim: true,
        default: "https://www.vecteezy.com/vector-art/30504836-avatar-account-flat-vector-isolated-on-transparent-background-for-graphic-and-web-design-default-social-media-profile-photo-symbol-profile-and-people-silhouette-user-icon"
    },
    isActive: {
        type: Boolean,
        default: true
    }

}, { timestamps: true });

module.exports = new mongoose.model("Users", userSchema)