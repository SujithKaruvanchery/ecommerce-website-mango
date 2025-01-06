const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Products',
                required: true,
            },
            // quantity: {
            //     type: Number,
            //     required: true,
            //     min: 1,
            // },
            price: {
                type: Number,
                required: true,
            },
        },
    ],
    totalPrice: {
        type: Number,
        required: true,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

cartSchema.methods.calculateTotalPrice = function () {
    this.totalPrice = this.products.reduce((total, product) => total + product.price, 0)
}

module.exports = new mongoose.model("Cart", cartSchema)