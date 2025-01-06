const { getOrdersByUserId, getAllOrders, getAllOrdersBySeller, updateOrderStatus } = require("../../controllers/orderControllers");
const { adminAuth } = require("../../middlewares/adminAuth");
const { sellerAuth } = require("../../middlewares/sellerAuth");
const { userAuth } = require("../../middlewares/userAuth");


const orderRouter = require("express").Router();

orderRouter.get("/get-order-by-userid", userAuth, getOrdersByUserId)
orderRouter.get("/get-all-orders", adminAuth, getAllOrders)
orderRouter.get("/get-all-orders-seller", sellerAuth, getAllOrdersBySeller)
orderRouter.put("/orders/:orderId/status", sellerAuth, updateOrderStatus)

module.exports = orderRouter;