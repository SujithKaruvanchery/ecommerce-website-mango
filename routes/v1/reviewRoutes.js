const { deleteReview, getAverageRating, addReview, getProductReview } = require('../../controllers/reviewControllers');
const { userAuth } = require('../../middlewares/userAuth');

const reviewRouter = require('express').Router()

reviewRouter.get("/get-reviews", userAuth, getProductReview);
reviewRouter.post("/add-product-review", userAuth, addReview);
reviewRouter.get("/get-avg-rating", userAuth, getAverageRating);
reviewRouter.delete("/delete-review", userAuth, deleteReview);

module.exports = reviewRouter

