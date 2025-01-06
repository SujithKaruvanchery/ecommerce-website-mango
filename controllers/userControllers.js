const UserDB = require("../models/userModel");
const AdminDB = require("../models/adminModel");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/token");

const registerUser = async (req, res) => {
    try {
        const { name, email, mobile, password } = req.body;
        if (!name || !email || !mobile || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const userAlreadyExistWithEmail = await UserDB.findOne({ email });

        if (userAlreadyExistWithEmail) {
            return res.status(400).json({ error: "User with this email already exists" });
        }

        const userAlreadyExistWithMobile = await UserDB.findOne({ mobile });

        if (userAlreadyExistWithMobile) {
            return res.status(400).json({ error: "User with this mobile number already exists" });
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log(hashedPassword);

        const newUser = new UserDB({
            name, email, password: hashedPassword, mobile
        });

        const savedUser = await newUser.save();
        res.status(200).json({ message: "User created successfully", data: savedUser });

    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ error: error.message || "Internal Server Error" });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const user = await UserDB.findOne({ email });
        console.log(user, "=======userdata");

        if (!user) {
            return res.status(400).json({ error: "User does not exist" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        console.log(passwordMatch, "=======passwordMatch");

        if (!passwordMatch) {
            return res.status(400).json({ error: "Incorrect password" });
        }

        if (!user.isActive) {
            return res.status(400).json({ error: "User profile is deactivated" });
        }

        const token = generateToken(user, "user");
        console.log(token, "=======token");

        res.cookie("user_token", token);

        res.status(200).json({ message: "Login successful", data: user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};

const userProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log("=======userid", userId);

        const userData = await UserDB.findById(userId).select("-password");
        console.log("=======userdata", userData);

        if (!userData) {
            return res.status(404).json({ error: "User not found" });
        }

        if (!userData.isActive) {
            return res.status(403).json({ error: "User account is deactivated" });
        }

        res.status(200).json({ message: "User profile fetched successfully", data: userData });
    } catch (error) {
        console.error(error);
        return res.status(error.status || 500).json({ error: error.message || "Internal Server Error" });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(userId, "=======userid");

        const { name, email, mobile } = req.body;

        if (!name && !email && !mobile) {
            return res.status(400).json({ error: "At least one field is required to update" });
        }

        if (email) {
            const existingUserWithEmail = await UserDB.findOne({ email });
            if (existingUserWithEmail && existingUserWithEmail._id.toString() !== userId) {
                return res.status(400).json({ error: "Email already in use by another user" });
            }
        }

        if (mobile) {
            const existingUserWithMobile = await UserDB.findOne({ mobile });
            if (existingUserWithMobile && existingUserWithMobile._id.toString() !== userId) {
                return res.status(400).json({ error: "Mobile number already in use by another user" });
            }
        }

        const user = await UserDB.findById(userId);
        console.log("=======user", user);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (!user.isActive) {
            return res.status(403).json({ error: "User account is deactivated" });
        }

        Object.assign(user, { name, email, mobile });
        console.log({ name, email, mobile }, "=======user updates");

        await user.save();

        const updatedUser = await UserDB.findById(userId).select("-password");

        res.status(200).json({ message: "User profile updated successfully", data: updatedUser });

    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ error: error.message || "Internal Server Error" });
    }
};

const checkUser = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log("=======userid", userId);

        const user = await UserDB.findById(userId);
        console.log("=======user", user);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (!user.isActive) {
            return res.status(403).json({ error: "User account is deactivated" });
        }

        return res.status(200).json({ message: "Authorized user" });
    } catch (error) {
        console.error(error);
        return res.status(error.status || 500).json({ error: error.message || "Internal Server Error" });
    }
};


const logoutUser = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log("=======userid", userId)
        const user = await UserDB.findById(userId);
        console.log("=======user", user)

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (!user.isActive) {
            return res.status(403).json({ error: "User account is deactivated" });
        }

        res.clearCookie("user_token");

        res.status(200).json({ message: "User logout successful" });
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ error: error.message || "Internal Server Error" });
    }
};


const deactivateUser = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("=======userid", id);

        const adminId = req.user.id;
        console.log("=======adminid", adminId);

        const user = await UserDB.findById(id);
        console.log("=======user", user);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const admin = await AdminDB.findById(adminId);
        console.log("=======admin", admin);
        if (!admin || admin.role !== "admin") {
            return res.status(403).json({ message: "Only admins can access this resource" });
        }

        if (!user.isActive) {
            return res.status(400).json({ message: "User is already deactivated" });
        }

        user.isActive = false;
        await user.save();

        return res.status(200).json({ message: "User deactivated successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const activateUser = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("=======userid", id);

        const adminId = req.user.id;
        console.log("=======adminid", adminId);

        const user = await UserDB.findById(id);
        console.log("=======user", user);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const admin = await AdminDB.findById(adminId);
        console.log("=======admin", admin);
        if (!admin || admin.role !== "admin") {
            return res.status(403).json({ message: "Only admins can access this resource" });
        }

        if (user.isActive) {
            return res.status(400).json({ message: "User is already activated" });
        }

        user.isActive = true;
        await user.save();

        return res.status(200).json({ message: "User activated successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await UserDB.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve users', error });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        console.log("User Id :- ", id);

        const user = await UserDB.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({ message: "Sorry, user not found" });
        }

        return res.status(200).json({ message: "Successfully deleted User account" });

    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(error.status || 500).json({ error: error.message || "Internal server error" });
    }
};

module.exports = { registerUser, loginUser, userProfile, logoutUser, checkUser, updateUserProfile, deactivateUser, activateUser,getAllUsers, deleteUser };
