const { fileURLToPath } = require("url");
const { dirname, join } = require("path");
const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const checkReferer = require("./middlewares/checkReferer");
const mongoSanitize = require("./middlewares/mongoSanitize");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const appRoutes = require("./routes/appRoutes");
const borrowRoutes = require("./routes/borrowRoutes");
const donationRoutes = require("./routes/donationRoutes");
const ebookRoutes = require("./routes/ebookRoutes");
const physicalBookRoutes = require("./routes/physicalBookRoutes");
const genreRoutes = require("./routes/genreRoutes");
const authControllers = require("./controllers/authControllers");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

// Body parsers and middleware MUST come before routes
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(mongoSanitize);
app.use(cors());

// Static file serving
app.use("/styles", checkReferer, express.static(join(__dirname, "styles")));
app.use("/scripts", checkReferer, express.static(join(__dirname, "scripts")));
app.use("/uploads", express.static(join(__dirname, "uploads")));
app.use("/images", express.static(join(__dirname, "images")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/donations", authControllers.protect, donationRoutes);
app.use("/api/books/physical", authControllers.protect, physicalBookRoutes);
app.use("/api/books/ebook", authControllers.protect, ebookRoutes);
app.use("/api/books/genre", genreRoutes);
app.use("/api/borrows", authControllers.protect, borrowRoutes);
app.use("/api/dashboard/", dashboardRoutes);
app.use("/api/users", userRoutes);

// Page Routes (must come after API routes)
app.use("/", appRoutes);

// 404 handler for debugging
app.use((req, res, next) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: "Route not found",
    method: req.method,
    path: req.originalUrl,
  });
});

const PORT = process.env.PORT || 7001;

mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => console.log("Successfully Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

// For Vercel deployment
if (process.env.NODE_ENV === "production") {
  module.exports = app;
} else {
  app.listen(PORT, () => {
    console.log(`Server is Running at port ${PORT}`);
  });
}
