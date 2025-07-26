import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/auth.js"; // You must rename auth.js to auth.js instead of auth (CommonJS default)
import donationRoutes from "./routes/donationRoutes.js"; // ES modules require full filename
import contactRoutes from "./routes/contactRoutes.js";
import confirmDonation from './routes/confirmDonation.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
console.log("✅ authRoutes loaded:", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/donate", donationRoutes);
app.use("/api/contact", contactRoutes);
app.use('/api', confirmDonation);

// Root route
app.get("/", (req, res) => {
  res.send("FoodShare API is running");
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
