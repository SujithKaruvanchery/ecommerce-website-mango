const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100,
        unique:true
    },
    description: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 1000,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    image: {
        type: String,
        required: true,
    },
    stockQuantity: {
        type: Number,
        required: true,
        min: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    seller: { type: mongoose.Types.ObjectId, ref: "Seller" }
}, { timestamps: true })

module.exports = new mongoose.model("Products", productSchema)