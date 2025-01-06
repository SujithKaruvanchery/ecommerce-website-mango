const jwt = require('jsonwebtoken');

const adminAuth = (req, res, next) => {
    try {
        const { admin_token } = req.cookies;
        console.log("======= Cookies:", req.cookies);

        if (!admin_token) {
            return res.status(401).json({ error: "Admin token not provided" });
        }

        const decoded = jwt.verify(admin_token, process.env.JWT_SECRET);
        console.log("======= Decoded Token:", decoded);

        if (!decoded) {
            return res.status(401).json({ error: "Invalid token" });
        }

        if (decoded.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }

        req.user = decoded;

        next();
    } catch (error) {
        console.error("Error in adminAuth middleware:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { adminAuth };

