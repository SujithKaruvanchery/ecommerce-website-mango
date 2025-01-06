const AdminDB = require("../models/adminModel");
const ProductDB = require("../models/productModel");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/token");
const crypto = require('crypto'); 
const nodemailer = require('nodemailer')

const registerAdmin = async (req, res) => {
    try {
        const { name, email, mobile, password, role } = req.body;
        if (!name || !email || !mobile || !password || !role) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const adminAlreadyExistWithEmail = await AdminDB.findOne({ email });

        if (adminAlreadyExistWithEmail) {
            return res.status(400).json({ error: "Admin with this email already exists" });
        }

        const adminAlreadyExistWithMobile = await AdminDB.findOne({ mobile });

        if (adminAlreadyExistWithMobile) {
            return res.status(400).json({ error: "Admin with this mobile number already exists" });
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log(hashedPassword);

        const newAdmin = new AdminDB({
            name, email, password: hashedPassword, mobile, role
        });

        const savedAdmin = await newAdmin.save();
        res.status(200).json({ message: "Admin created successfully", data: savedAdmin });

    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ error: error.message || "Internal Server Error" });
    }
};

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const admin = await AdminDB.findOne({ email });
        console.log(admin, "=======Admin Data");

        if (!admin) {
            return res.status(400).json({ error: "Admin does not exist" });
        }

        const passwordMatch = await bcrypt.compare(password, admin.password);
        console.log(passwordMatch, "========Password Match");

        if (!passwordMatch) {
            return res.status(400).json({ error: "Incorrect password" });
        }

        if (!admin.isActive) {
            return res.status(400).json({ error: "Admin profile is deactivated" });
        }

        const token = generateToken(admin, "admin");
        console.log(token, "=======Token");

        res.cookie("admin_token", token);

        res.status(200).json({ message: "Login successful", data: admin });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};

const adminProfile = async (req, res) => {
    try {
        const adminId = req.user.id;
        const adminData = await AdminDB.findById(adminId).select("-password");
        res.status(200).json({ message: "Admin profile fetched", data: adminData });
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ error: error.message || "Internal Server Error" });
    }
};

const logoutAdmin = async (req, res) => {
    try {
        res.clearCookie("admin_token");

        res.status(200).json({ message: "Admin logged out successfully" });
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ error: error.message || "Internal Server Error" });
    }
};

const checkAdmin = async (req, res) => {
    try {
        res.status(200).json({ message: "Authorized Admin" });
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ error: error.message || "Internal Server Error" });
    }
};

const updateAdminProfile = async (req, res) => {
    try {
        const adminId = req.user.id;
        console.log(adminId, "=======Admin ID");
        const { name, email, mobile, role } = req.body;

        if (!name && !email && !mobile && !role) {
            return res.status(400).json({ error: "At least one field is required to update" });
        }

        if (email) {
            const existingAdminWithEmail = await AdminDB.findOne({ email });
            if (existingAdminWithEmail && existingAdminWithEmail.id !== adminId) {
                return res.status(400).json({ error: "Email already in use by another user" });
            }
        }

        if (mobile) {
            const existingAdminWithMobile = await AdminDB.findOne({ mobile });
            if (existingAdminWithMobile && existingAdminWithMobile.id !== adminId) {
                return res.status(400).json({ error: "Mobile number already in use by another user" });
            }
        }

        const admin = await AdminDB.findById(adminId);

        if (!admin) {
            return res.status(404).json({ error: "Admin not found" });
        }

        Object.assign(admin, { name, email, mobile, role });
        console.log({ name, email, mobile, role }, "=======Admin Updates");

        await admin.save();

        const updatedAdmin = await AdminDB.findById(adminId).select("-password");

        res.status(200).json({ message: "User profile updated successfully", data: updatedAdmin });
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ error: error.message || "Internal Server Error" });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    
    try {
      // Find the admin by email
      const admin = await AdminDB.findOne({ email });
      if (!admin) {
        return res.status(404).json({ error: "Admin not found with this email" });
      }
  
      // Generate reset token
      const resetToken = crypto.randomBytes(20).toString('hex');
      admin.resetPasswordToken = resetToken;
      admin.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
      await admin.save();
  
      // Send email with reset link
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`; // Frontend URL from env
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
  
      const mailOptions = {
        to: email,
        subject: 'Password Reset Request',
        html: `Click <a href="${resetUrl}">here</a> to reset your password.`,
      };
  
      await transporter.sendMail(mailOptions);
  
      res.status(200).json({ message: 'Password reset link sent to email' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  // Reset password handler
  const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    // Log the password and salt to check for issues
    console.log("Password:", password);

    try {
      // Find the admin by reset token and check if token is expired
      const admin = await AdminDB.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!admin) {
        return res.status(400).json({ error: "Invalid or expired token" });
      }

      // Check if the password exists and is not empty
      if (!password || password.trim() === "") {
        return res.status(400).json({ error: "Password is required" });
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      console.log("Generated Salt:", salt); // Debugging line
      const hashedPassword = await bcrypt.hash(password, salt);

      // Update the admin's password and clear reset token
      admin.password = hashedPassword;
      admin.resetPasswordToken = undefined;
      admin.resetPasswordExpires = undefined;

      await admin.save();

      res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { registerAdmin, loginAdmin, logoutAdmin, checkAdmin, adminProfile, updateAdminProfile ,forgotPassword,resetPassword};
