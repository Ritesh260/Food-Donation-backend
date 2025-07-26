import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
  restaurantName: String,
  foodDescription: String,
  quantity: String,
  expiryDate: String,
  mobile: String,
  location: String,
  email: String, // ✅ Add this line
  imageUrl: String,
  status: {
    type: String,
    default: "Pending",
  },
}, {
  timestamps: true,
});

export default mongoose.model("Donation", donationSchema);
