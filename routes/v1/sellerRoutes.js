const { registerSeller, loginSeller, sellerProfile, checkSeller, updateSellerProfile, logoutSeller, getAllSellers, deleteSeller } = require('../../controllers/sellerController')
const { adminAuth } = require('../../middlewares/adminAuth')
const { sellerAuth } = require('../../middlewares/sellerAuth')

const sellerRouter = require('express').Router()

sellerRouter.post("/signup", registerSeller)
sellerRouter.post("/login", loginSeller)
sellerRouter.get("/profile", sellerAuth, sellerProfile)
sellerRouter.get("/logout", logoutSeller)
sellerRouter.get("/check-seller", sellerAuth, checkSeller)
sellerRouter.put("/update-profile", sellerAuth, updateSellerProfile)
sellerRouter.get("/get-all-sellers", adminAuth, getAllSellers)
sellerRouter.delete("/delete-seller/:id", adminAuth, deleteSeller)

module.exports = sellerRouter
