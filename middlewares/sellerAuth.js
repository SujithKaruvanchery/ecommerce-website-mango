const jwt = require('jsonwebtoken');

const sellerAuth = (req, res, next) => {
    try {
        const { seller_token } = req.cookies;

        if (!seller_token) {
            return res.status(401).json({ error: "Seller token not provided" });
        }

        const decoded = jwt.verify(seller_token, process.env.JWT_SECRET);
        console.log(decoded, "=======decoded token")

        if (!decoded || decoded.role !== "seller") {
            return res.status(401).json({ error: "Seller not authorized" });
        }

        req.user = decoded;
        next();
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || "Internal server Error" })
    }
};

module.exports = { sellerAuth };
