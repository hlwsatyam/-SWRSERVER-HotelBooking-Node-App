const mongoose = require("mongoose");

const HotelOwnerSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  name: {
    type: String,
  },
  password: {
    type: String,
  },

  phone: {
    type: String,
  },
  Hotel: [{ type: mongoose.Schema.ObjectId, ref: "Hotel" }],
});
const HotelOwnerModel = mongoose.model("hotelOwner", HotelOwnerSchema);
module.exports = HotelOwnerModel;
