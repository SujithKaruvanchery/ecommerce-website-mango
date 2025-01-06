const { getProduct, createProduct, getProductById, deleteProduct, updateProduct, productCategory, productNewArrival } = require('../../controllers/productControllers')
const { upload } = require('../../middlewares/multer')
const { sellerAuth } = require('../../middlewares/sellerAuth')

const productRouter = require('express').Router()

productRouter.get("/get-all-products", getProduct)
productRouter.get("/get-product/:id", getProductById)
productRouter.post("/create-product",sellerAuth,upload.single("image"), createProduct)
productRouter.put("/update-product/:id", updateProduct)
productRouter.delete("/delete-product/:id", deleteProduct)
productRouter.get("/products/:category", productCategory)
productRouter.get('/new-arrivals', productNewArrival);

module.exports = productRouter
