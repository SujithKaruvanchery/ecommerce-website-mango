const { registerAdmin, loginAdmin, checkAdmin, logoutAdmin, adminProfile, updateAdminProfile, resetPassword, forgotPassword } = require('../../controllers/adminControllers')
const { adminAuth } = require('../../middlewares/adminAuth')

const adminRouter = require('express').Router()

adminRouter.post("/signup", registerAdmin)
adminRouter.post("/login", loginAdmin)
adminRouter.get("/profile", adminAuth, adminProfile)
adminRouter.get("/logout", logoutAdmin)
adminRouter.get("/check-admin", adminAuth, checkAdmin)
adminRouter.put("/update-profile", adminAuth, updateAdminProfile)
adminRouter.post('/forgot-password', forgotPassword);
adminRouter.post('/reset-password/:token', resetPassword);

module.exports = adminRouter
