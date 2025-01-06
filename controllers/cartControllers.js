const CartDB = require("../models/cartModel")
const ProductDB = require("../models/productModel")

const getCart = async (req, res) => {
    try {
        const userId = req.user.id
        console.log("=======userid", userId)

        const cart = await CartDB.findOne({ userId }).populate("products.productId")
        if (!cart) {
            return res.status(404).json({ message: "Cart Not Found" })
        }
        res.status(200).json({ message: "Cart Fetched Successfully", data: cart })
        console.log("=======cart", cart)

    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ error: error.message || "Internal Server Error" });
    }
}

const addProductToCart = async (req, res) => {
    try {
        const userId = req.user.id
        console.log("=======userid", userId)
        const { productId } = req.body
        console.log("=======productid", productId)

        if (!productId) {
            return res.status(404).json({ message: "Please Provide ProductId" })
        }

        const product = await ProductDB.findById(productId)
        if (!product) {
            return res.status(404).json({ message: "Product Not Found" })
        }
        console.log("=======product", product)

        let cart = await CartDB.findOne({ userId })
        if (!cart) {
            cart = new CartDB({ userId, products: [] })
        }

        const productExists = cart.products.some((item) => item.productId.equals(productId))
        if (productExists) {
            return res.status(400).json({ message: "Product Already In Cart" })
        }
        console.log("=======productexists", productExists)

        cart.products.push({
            productId,
            price: product.price
        })

        cart.calculateTotalPrice()

        await cart.save()

        res.status(200).json({ message: "Product Added To Cart", cart })

    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ error: error.message || "Internal Server Error" });
    }
}

const removeProductFromCart = async (req, res) => {
    try {
        const userId = req.user.id
        console.log("=======userid", userId)
        const { productId } = req.body
        console.log("=======productid", productId)

        const cart = await CartDB.findOne({ userId })
        console.log("=======cart", cart)

        if (!cart) {
            return res.status(404).json({ message: "Cart Not Found" })
        }

        cart.products = cart.products.filter((item) => !item.productId.equals(productId))

        cart.calculateTotalPrice()

        await cart.save()

        res.status(200).json({ message: "Cart Item Removed", data: cart })
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ error: error.message || "Internal Server Error" });
    }
}

const clearCart = async (req, res) => {
    try {
        const userId = req.user.id
        console.log("=======userid", userId)

        const cart = await CartDB.findOne({ userId })
        console.log("=======cart", cart)

        cart.products = []
        cart.calculateTotalPrice()
        await cart.save()

        res.status(200).json({ message: "Cart Cleared Successfully", data: cart })
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ error: error.message || "Internal Server Error" });
    }
}

module.exports = { getCart, addProductToCart, removeProductFromCart, clearCart }
