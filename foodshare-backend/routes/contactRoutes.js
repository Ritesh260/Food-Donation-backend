import express from "express";
import Contact from "../models/Contact.js";
import sendMail from "../utils/sendmail.js"; // 👈 Import mail utility

const router = express.Router();

// POST /api/contact
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const contact = new Contact({ name, email, message });
    await contact.save();

    // 📧 Send email to yourself when someone contacts
    const subject = "New Contact Request";
    const html = `
      <h3>You have a new contact request</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong> ${message}</p>
    `;

    // 👇 Change to your own email if needed
    await sendMail(process.env.MAIL_USER, subject, html);

    res.status(201).json({ message: "Contact message saved", contact });
  } catch (err) {
    console.error("Contact save error:", err);
    res.status(500).json({ message: "Failed to save contact" });
  }
});

// GET all contact messages
router.get("/", async (req, res) => {
  try {
    const messages = await Contact.find().sort({ date: -1 });
    res.json(messages);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

export default router;
