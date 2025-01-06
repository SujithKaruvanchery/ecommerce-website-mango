const { getCart, addProductToCart, clearCart, removeProductFromCart } = require('../../controllers/cartControllers')
const { userAuth } = require('../../middlewares/userAuth')

const cartRouter = require('express').Router()

cartRouter.get("/get-cart", userAuth, getCart)
cartRouter.post("/add-to-cart", userAuth, addProductToCart)
cartRouter.delete("/remove-from-cart", userAuth, removeProductFromCart)
cartRouter.delete("/clear-cart", userAuth, clearCart)

module.exports = cartRouter