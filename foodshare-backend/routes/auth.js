import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import sendMail from "../utils/sendmail.js";


const router = express.Router();

// ✅ REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// ✅ LOGIN – email send after success
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // ✅ Send email after login
   const html = `
  <h3 style="color: #4CAF50;">🙏 Namaste ${user.name},</h3>
  <p>We are truly honored to welcome you to the <strong>Food Donation Platform</strong>.</p>
  
  <p>You have successfully logged in to your account. Thank you for choosing to be a part of this noble cause. By joining us, you are contributing to reducing food waste and helping those in need — and for that, we are deeply grateful.</p>

  <p>If you plan to donate food, kindly make sure the details you provide are accurate and that the food is safe and fresh.</p>

  <p>Feel free to explore the platform and help us make a positive impact, one meal at a time.</p>

  <br>
  <p>With heartfelt gratitude,</p>
  <p><strong>Team Food Donation Platform</strong></p>
`;
await sendMail(user.email, "Welcome & Login Confirmation – Food Donation Platform", html);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// ✅ GET USERS
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "name email _id");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error while fetching users" });
  }
});

export default router;
