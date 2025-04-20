const express = require("express");
const User = require("./models/User");
const router = express.Router();

router.post("/verify-otp", async (req, res) => {
    const { email, otp } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });

        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if OTP matches and if it has expired
        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP." });
        }

        const currentTime = new Date();
        if (currentTime > user.isExpired) {
            return res.status(400).json({ message: "OTP has expired." });
        }

        // Update the user's isVerified status
        user.isVerified = true;
        await user.save();

        // Respond with success
        res.status(200).json({ message: "Email verified successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error." });
    }
});

module.exports = router;
