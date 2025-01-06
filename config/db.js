const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("db connected successfully");
    } catch (error) {
        console.log(error);
    }
};

module.exports = connectDB;
