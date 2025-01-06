const ProductDB = require("../models/productModel");
const ReviewDB = require("../models/reviewModel");

const addReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const userId = req.user.id;
        console.log("=======userId", userId);

        const product = await ProductDB.findById(productId);
        console.log("=======product", product);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (rating > 5 || rating < 1) {
            return res.status(400).json({ message: "Please provide a valid rating between 1 and 5" });
        }

        const review = await ReviewDB.findOneAndUpdate(
            { userId, productId },
            { rating, comment },
            { new: true, upsert: true }
        );
        console.log("=======review", review);

        res.status(201).json({ message: "Review created", data: review });
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ error: error.message || "Internal Server Error" });
    }
};

const getProductReview = async (req, res) => {
    try {
        const { productId } = req.params;
        console.log("=======productId", productId);

        const reviews = await ReviewDB.find({ productId }).populate("userId", "name").sort({ createdAt: -1 });
        console.log("=======reviews", reviews);

        if (!reviews.length) {
            return res.status(404).json({ message: "No reviews found for this product" });
        }

        res.status(200).json({ message: "Product reviews fetched", data: reviews });
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ error: error.message || "Internal Server Error" });
    }
};

const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        console.log("=======reviewId", reviewId);

        const userId = req.user.id;
        console.log("=======userId", userId);

        const review = await ReviewDB.findOneAndDelete({ _id: reviewId, userId });
        console.log("=======review", review);

        if (!review) {
            return res.status(404).json({ message: "Review not found or not authorized" });
        }

        res.status(200).json({ message: "Review deleted successfully", data: review });
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ error: error.message || "Internal Server Error" });
    }
};

const getAverageRating = async (req, res) => {
    try {
        const { productId } = req.params;
        console.log("=======productId", productId);

        const reviews = await ReviewDB.find({ productId });
        console.log("=======reviews", reviews);

        if (!reviews.length) {
            return res.status(404).json({ message: "No reviews found for this product" });
        }

        const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
        console.log("=======averageRating", averageRating);

        res.status(200).json({ message: "Average rating fetched", data: averageRating });
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ error: error.message || "Internal Server Error" });
    }
};

module.exports = { addReview, getAverageRating, deleteReview, getProductReview };
