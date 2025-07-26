import express from "express";
import multer from "multer";
import Donation from "../models/Donation.js";
import sendMail from '../utils/sendmail.js';


const router = express.Router();
// Set up Multer for image upload (currently using memoryStorage)
const storage = multer.memoryStorage(); // or use diskStorage if you want to save files on disk
const upload = multer({ storage });

// POST /api/donate — to save donation data
router.post("/", upload.single("image"), async (req, res) => 
   
{
  try {
    const {
      restaurantName,
      foodDescription,
      quantity,
      expiryDate,
      mobile,
      location,
      email,
    } = req.body;

    const donation = new Donation({
      restaurantName,
      foodDescription,
      quantity,
      expiryDate,
      mobile,
      
      location,
      imageUrl: req.file ? req.file.originalname : null,
      email, // or req.file.filename if using diskStorage
    });
console.log("Received email:", email);

    await donation.save();
    // 🔔 Email to admin
    const adminEmail = "riteshsaini734@gmail.com"; //actual admin email
    const subject = "New Food Donation Received";
    const html = `
      <h2>New Donation Alert 🚨</h2>
      <p><strong>Restaurant:</strong> ${restaurantName}</p>
      <p><strong>Food Description:</strong> ${foodDescription}</p>
      <p><strong>Quantity:</strong> ${quantity}</p>
      <p><strong>Expiry Date:</strong> ${expiryDate}</p>
      <p><strong>Mobile:</strong> ${mobile}</p>
      <p><strong>Location:</strong> ${location}</p>
      <p><strong>Donor Email:</strong> ${email}</p>
    `;
    await sendMail(adminEmail, subject, html);
    res.status(201).json({ message: "Donation saved", donation });
  } catch (error) {
    console.error("Donation error:", error);
    res.status(500).json({ message: "Error saving donation" });
  }
});

// ✅ GET /api/donate — to fetch all donations (for Admin Panel)
router.get("/", async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 }); // latest first
    res.status(200).json(donations);
  } catch (error) {
    console.error("Fetching donation error:", error);
    res.status(500).json({ message: "Error fetching donations" });
  }
});
// PUT /api/donate/status/:id
router.put("/status/:id", async (req, res) => {
  try {
    const updated = await Donation.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    // 📧 Send confirmation email only if status is marked as "Picked Up"
    if (updated && req.body.status === "Picked Up") {
      const subject = "Your Food Donation Has Been Picked Up!";
      const html = `
        <h2>Thank You for Your Kind Donation 🙏</h2>
        <p>Dear ${updated.restaurantName},</p>
        <p>We’re happy to inform you that your food donation has been successfully picked up.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li><strong>Food:</strong> ${updated.foodDescription}</li>
          <li><strong>Quantity:</strong> ${updated.quantity}</li>
          <li><strong>Location:</strong> ${updated.location}</li>
          <li><strong>Mobile:</strong> ${updated.mobile}</li>
        </ul>
        <p>We appreciate your generous contribution! 💚</p>
      `;
      await sendMail(updated.email, subject, html);
      console.log("Confirmation mail sent to:", updated.email);
    }

    res.json(updated);
  } catch (err) {
    console.error("Status update error:", err);
    res.status(500).json({ message: "Status update failed" });
  }
});


export default router;
