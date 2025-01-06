const OrderDB = require("../models/orderModel")

const getOrdersByUserId = async (req, res) => {
    try {
        const id = req.user.id;
        console.log("Fetching orders for user ID:", id);

        const orders = await OrderDB.find({ id })
            .populate("items.productId", "title price image")
            .exec();

        console.log("Orders fetched from DB:", orders);
        res.status(200).json({
            message: "Orders fetched successfully",
            data: orders,
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const getAllOrders = async (req, res) => {
    try {

        const orders = await OrderDB.find()
            .populate('userId', 'name email')
            .populate('items.productId', 'title price');

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve orders', error });
    }
};


const getAllOrdersBySeller = async (req, res) => {
    try {

        const orders = await OrderDB.find()
            .populate('id', 'name email')
            .populate('items.productId', 'title price');

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve orders', error });
    }
};


const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        if (!["processing", "transit", "out-for-delivery", "delivered"].includes(status)) {
            return res.status(400).json({ message: "Invalid order status" });
        }


        const updatedOrder = await OrderDB.findByIdAndUpdate(
            orderId,
            { orderStatus: status },
            { new: true, runValidators: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ message: "Order status updated successfully", order: updatedOrder });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

module.exports = { getOrdersByUserId, getAllOrders, updateOrderStatus, getAllOrdersBySeller };