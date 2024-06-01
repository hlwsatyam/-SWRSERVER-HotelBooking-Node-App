const mongoose = require("mongoose");

const HotelSchema = new mongoose.Schema({
  pin: { type: String, required: true },
  hotelName: { type: String, required: true },
  hotelPhone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  stars: { type: String },
  totalRooms: { type: String },
  hotelLocation: { type: String, required: true },
  description: { type: String, required: true },
  charge: { type: Number, required: true },
  facilities: [{ type: String }],
  details: [{ type: String }],
  images: [{ type: String }],
  owners: { type: mongoose.Schema.Types.ObjectId, ref: "Owner" },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
});
module.exports = mongoose.model("Hotel", HotelSchema);
