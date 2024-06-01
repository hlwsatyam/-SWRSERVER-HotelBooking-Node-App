const mongoose = require("mongoose");

const guestSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  nickname: {
    type: String,
  },
  dob: {
    type: Date,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  gender: {
    type: String,
  },
  phone: {
    type: String,
  },
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hotel" }],
});

const GuestModel = mongoose.model("Guest", guestSchema);

module.exports = GuestModel;
