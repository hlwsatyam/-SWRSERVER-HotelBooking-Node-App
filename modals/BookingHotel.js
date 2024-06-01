const Mongoos = require("mongoose");
const bookingSchema = new Mongoos.Schema({
  guest: { type: Mongoos.SchemaTypes.ObjectId, ref: "Guest" },
  dates: {
    type: String,
  },
  price: {
    type: Number,
  },
  personList: [],  
  isCanceled: {
    type: Boolean,
    default: false,
  },
  isAprooved: {
    type: Boolean,
    default: false,
  }, 
  isPaid: {
    type: Boolean,
    default: false,
  },
  hotelId: {
    type: Mongoos.SchemaTypes.ObjectId,
    ref: "Hotel",
  },
  roomOwner: {
    type: Mongoos.SchemaTypes.ObjectId,
    ref: "hotelOwner",
  },
  roomId: {
    type: Mongoos.SchemaTypes.ObjectId,
    ref: "HotelRoom",
  },
});
module.exports = Mongoos.model("Booking", bookingSchema);
