const { userAuth } = require("../../middlewares/userAuth")
const stripe = require("stripe")(process.env.Stripe_Secret_Api_Key);
const client_domain = process.env.CLIENT_DOMAIN;
const OrderDB = require("../../models/orderModel")

const paymentRouter = require("express").Router();


paymentRouter.post("/create-checkout-session", userAuth, async (req, res, next) => {
    try {
        const { products } = req.body;

        // Map products to Stripe line items
        const lineItems = products.map((product) => ({
            price_data: {
                currency: "inr",
                product_data: {
                    name: product?.productId?.title,
                    images: [product?.productId?.image],
                },
                unit_amount: Math.round(product?.productId?.price * 100),
            },
            quantity: product?.quantity || 1, // Use product quantity
        }));

        // Calculate the total amount
        const totalAmount = products.reduce(
            (sum, product) => sum + product?.productId?.price * (product?.quantity || 1),
            0
        );

        // Create Stripe session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${client_domain}/user/payment/success`,
            cancel_url: `${client_domain}/user/payment/cancel`,
        });

        // Save order details to the database
        const order = new OrderDB({
            userId: req.user.id, // Assuming userAuth middleware sets req.user
            items: products.map((product) => ({
                productId: product.productId, // Ensure productId is included
                name: product?.productId?.title,
                price: product?.productId?.price,
                quantity: product?.quantity || 1,
            })),
            
            totalAmount, // Pass the calculated total amount
            orderStatus: "processing", // Default status
        });

        await order.save(); // Save the order to the database

        // Respond with session details
        res.json({ success: true, sessionId: session.id });
    } catch (error) {
        console.error(error);
        res
            .status(error.status || 500)
            .json({ error: error.message || "Internal server error" });
    }
});


paymentRouter.get("/session-status", async (req, res) => {
    try {
        const sessionId = req.query.session_id;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        res.send({
            status: session?.status,
            customer_email: session?.customer_details?.email,
            session_data: session,
        });
    } catch (error) {
        res.status(error?.statusCode || 500).json(error.message || "internal server error");
    }
});


module.exports = paymentRouter;