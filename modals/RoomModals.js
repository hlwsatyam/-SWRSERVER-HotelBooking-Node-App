const mongoose = require("mongoose");

const HotelRoomSchema = new mongoose.Schema({
  roomType: { type: String, required: true },
  roomNo: { type: Number, required: true },
  roomPrice: { type: Number, required: true },
  roomDescription: { type: String, required: true },
  imageUrls: { type: [] },
  roomAvailability: { type: Boolean, default: false },
  selectedFacilities: { type: [], required: true },
  hotelId: { type: mongoose.Schema.ObjectId, ref: "Hotel" },
});
module.exports = mongoose.model("HotelRoom", HotelRoomSchema);
