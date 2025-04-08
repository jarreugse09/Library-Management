const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const verifyToken = async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Optional: Fetch user from DB to attach more info like role, username
            const user = await User.findById(decoded.id).select("-password");
            if (!user) return res.status(401).json({ message: "User not found" });

            req.user = {
                id: user._id.toString(),
                username: user.username,
                role: user.role
            };

            next();
        } catch (err) {
            return res.status(400).json({ message: "Token is not valid" });
        }
    } else {
        return res.status(401).json({ message: "No token, authorization denied" });
    }
};

module.exports = verifyToken;
