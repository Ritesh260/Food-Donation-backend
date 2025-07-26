// routes/confirmMail.js
import express from 'express';
import sendMail from '../utils/sendmail.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { email, hotelName, items, quantity, address, date } = req.body;

  const subject = `Donation Pickup Confirmation from Admin`;
  const html = `
    <h2>Hello ${hotelName},</h2>
    <p>Thank you for your food donation.</p>
    <p>✅ We have successfully picked up the following items:</p>
    <ul>
      <li><strong>Items:</strong> ${items}</li>
      <li><strong>Quantity:</strong> ${quantity}</li>
      <li><strong>Pickup Address:</strong> ${address}</li>
      <li><strong>Date:</strong> ${date}</li>
    </ul>
    <p>Regards,<br/>Team Food Donation</p>
  `;

  try {
    await sendMail(email, subject, html);
    res.status(200).json({ success: true, message: 'Confirmation email sent.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error sending email.' });
  }
});

export default router;
