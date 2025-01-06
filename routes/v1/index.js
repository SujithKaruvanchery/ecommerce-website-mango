const adminRouter = require('./adminRoutes')
const productRouter = require('./productRoutes')
const userRouter = require('./userRoutes')
const sellerRouter = require('./sellerRoutes')
const cartRouter = require('./cartRoutes')
const reviewRouter = require('./reviewRoutes')
const orderRouter = require('./orderRoutes')
const paymentRouter = require('./paymentRoutes')

const v1Router = require('express').Router()

v1Router.use("/user",userRouter)
v1Router.use("/product", productRouter)
v1Router.use("/admin", adminRouter)
v1Router.use("/seller", sellerRouter)
v1Router.use("/cart", cartRouter)
v1Router.use("/review", reviewRouter)
v1Router.use("/orders", orderRouter)
v1Router.use("/payment", paymentRouter)

module.exports = v1Router