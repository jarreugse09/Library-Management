const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // For OTP generation
const sendEmail = require("../utils/sendEmail");

const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: "Username or email already taken." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 3 * 60 * 1000); // expires in 3 minutes

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role: "user", // default
            otp,
            otpExpires,
            isVerified: false
        });

        console.log("OTP for verification (send via email in real app):", otp);

        sendEmail({
            email,
            subject: "LibAG OTP",
            otp
        });
        

        res.status(201).json({ message: `User registered. Check email for OTP.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Something went wrong." });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: `User with username ${username} not found.` });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        if (!user.isVerified) {
            return res.status(403).json({ message: "Please verify your account before logging in." });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Something went wrong." });
    }
};

const sendOtp = async (req, res) => {
    const { email } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.otp = otp;
        user.otpExpires = otpExpires;
        user.isVerified = false; // Mark as not verified
        await user.save();

        

        res.status(200).json({ message: "OTP sent to your email!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error sending OTP." });
    }
};



// Verify OTP
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "User already verified." });
        }

        if (!user.otpExpires || user.otpExpires < new Date()) {
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        if (String(user.otp) !== String(otp)) {
            return res.status(400).json({ message: "Invalid OTP." });
        }

        await User.findByIdAndUpdate(user._id, {isVerified: true, otp: null, otpExpires: null});

        res.status(200).json({ message: "Verification successful. You can now log in." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error verifying OTP." });
    }
};


// Admin can update roles
const updateUserRole = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Only admin can assign roles." });
        }

        const { username, newRole } = req.body;
        if (!["poster", "commenter", "reactor"].includes(newRole)) {
            return res.status(400).json({ message: "Invalid role assignment." });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: `User with username ${username} not found.` });
        }

        user.role = newRole;
        await user.save();

        res.status(200).json({ message: `User ${username} is now assigned as ${newRole}` });
    } catch (err) {
        res.status(500).json({ message: "Something went wrong." });
    }
};

// Get current logged-in user
const getCurrentUser = async (req, res) => {
    res.json({ username: req.user.username, role: req.user.role });
};

module.exports = {
    register,
    login,
    updateUserRole,
    getCurrentUser,
    sendOtp,
    verifyOtp,
};
