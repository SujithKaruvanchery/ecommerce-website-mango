const SellerDB = require("../models/sellerModel");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/token");

const registerSeller = async (req, res) => {
    try {
        const { name, email, mobile, password, role, storeName, address } = req.body;
        if (!name || !email || !mobile || !password || !role || !storeName || !address) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const sellerAlreadyExistWithEmail = await SellerDB.findOne({ email });

        if (sellerAlreadyExistWithEmail) {
            return res.status(400).json({ error: "Seller with this email already exists" });
        }

        const sellerAlreadyExistWithMobile = await SellerDB.findOne({ mobile });

        if (sellerAlreadyExistWithMobile) {
            return res.status(400).json({ error: "Seller with this mobile number already exists" });
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log(hashedPassword);

        const newSeller = new SellerDB({
            name, email, password: hashedPassword, mobile, role, storeName, address
        });

        const savedSeller = await newSeller.save();
        res.status(200).json({ message: "Seller created successfully", data: savedSeller });

    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ error: error.message || "Internal Server Error" });
    }
};

const loginSeller = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const seller = await SellerDB.findOne({ email });
        console.log(seller, "=======sellerData");

        if (!seller) {
            return res.status(400).json({ error: "Seller does not exist" });
        }

        const passwordMatch = await bcrypt.compare(password, seller.password);
        console.log(passwordMatch, "========passwordMatch");

        if (!passwordMatch) {
            return res.status(400).json({ error: "Incorrect password" });
        }

        if (!seller.isActive) {
            return res.status(400).json({ error: "Seller profile is deactivated" });
        }

        const token = generateToken(seller, "seller");
        console.log(token, "=======token");

        res.cookie("seller_token", token);

        res.status(200).json({ message: "Login successful", data: seller });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};

const sellerProfile = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const sellerData = await SellerDB.findById(sellerId).select("-password");
        res.status(200).json({ message: "Seller profile fetched", data: sellerData });
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ error: error.message || "Internal Server Error" });
    }
};

const checkSeller = async (req, res) => {
    try {
        res.status(200).json({ message: "Authorized seller" });
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ error: error.message || "Internal Server Error" });
    }
};

const updateSellerProfile = async (req, res) => {
    try {
        const sellerId = req.user.id;
        console.log(sellerId, "=======sellerId");
        const { name, email, mobile, role, storeName, address } = req.body;

        if (!name && !email && !mobile && !role && !storeName && !address) {
            return res.status(400).json({ error: "At least one field is required to update" });
        }

        if (email) {
            const existingSellerWithEmail = await SellerDB.findOne({ email });
            if (existingSellerWithEmail && existingSellerWithEmail !== sellerId) {
                return res.status(400).json({ error: "Email already in use by another user" });
            }
        }

        if (mobile) {
            const existingSellerWithMobile = await SellerDB.findOne({ mobile });
            if (existingSellerWithMobile && existingSellerWithMobile !== sellerId) {
                return res.status(400).json({ error: "Mobile number already in use by another user" });
            }
        }

        const seller = await SellerDB.findById(sellerId);

        if (!seller) {
            return res.status(404).json({ error: "Seller not found" });
        }

        Object.assign(seller, { name, email, mobile, role, storeName, address });
        console.log({ name, email, mobile, role, storeName, address }, "=======seller updates");

        await seller.save();

        const updatedSeller = await SellerDB.findById(sellerId).select("-password");

        res.status(200).json({ message: "Seller profile updated successfully", data: updatedSeller });
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ error: error.message || "Internal Server Error" });
    }
};

const logoutSeller = async (req, res) => {
    try {
        res.clearCookie("seller_token");

        res.status(200).json({ message: "Seller logout successful" });
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ error: error.message || "Internal Server Error" });
    }
};

const getAllSellers = async (req, res) => {
    try {
        const users = await SellerDB.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve users', error });
    }
};

const deleteSeller = async (req, res) => { 
    try {  
        
        const { Id } = req.params; 

        console.log("Seller Id :- ", Id);

        const seller = await SellerDB.findByIdAndDelete(Id);

        if (!seller) {
            return res.status(404).json({ message: "Sorry, Seller not found" });
        }

        return res.status(200).json({ message: "Successfully deleted Seller account" });

    } catch (error) {
        console.error("Error deleting Seller:", error);
        return res.status(error.status || 500).json({ error: error.message || "Internal server error" });
    }
};

module.exports = { registerSeller, loginSeller, sellerProfile, checkSeller, updateSellerProfile, logoutSeller ,getAllSellers, deleteSeller};
