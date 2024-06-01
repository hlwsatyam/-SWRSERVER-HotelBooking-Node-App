const express = require("express");
const {
  createAccount,
  createAccWithEmailPass,
  editProfile,
  forgetPassword,
  createNewPass,
  createHotel,
  searchingHotel,
  searchingHotelById,
  bookingHistoryOFUser,
  hotelBooking,
  getUserInfo,
  hotelOwnerLogin,
  findHotelsOfOwner,
  hotelOwnerInfo,
  deleteHotelByOwner,
  createUpHotel,
  updateUserProfile,
  bookedHotel,
  cencelHotel,
  addRev,
  findRev,
  findBookedOwnerHotel,
  addUpRoom,
  searchingRoomForThisHotel,
  deleteRoom,
  searchingHotelForBookMark,
  RoomAvailabilityCheck,
  findBookedGuestHotel,
  Welcome,
  citiesHotels,
  approveBooking,
} = require("../controllers/app");
const multer = require("multer");
const { uuid } = require("uuidv4");
const path = require("path");
const { 
  guestAuthentication, 
} = require("../sensitiveToken/guestAuthentication");
const Router = express.Router();
const parentDirectory = path.resolve(__dirname, "..");
const Storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `${parentDirectory}/uploads`);
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${uuid()}_${file.originalname}.png`;
    cb(null, uniqueFilename);
  },
}); 
const upload = multer({ storage: Storage });
Router.get("/", Welcome);
Router.post("/accountcreate", createAccount);
Router.post("/createAccountWithEmailPassword", createAccWithEmailPass);
Router.post("/editProfile", guestAuthentication, editProfile);
Router.post("/forgetPassword", forgetPassword);
Router.post("/createPassword", guestAuthentication, createNewPass);
Router.post("/updateuser", guestAuthentication, updateUserProfile);
Router.post("/users", guestAuthentication, getUserInfo);
// creating Hotel
Router.post("/v1/users", hotelOwnerLogin);
Router.post("/createHotel", createHotel);
Router.post("/searchingHotel", searchingHotel);
Router.post("/searchingHotelForBookMark", searchingHotelForBookMark);
Router.post("/citiesHotels", citiesHotels);
Router.post("/AllRoomForThisHotel/:hotelId", searchingRoomForThisHotel);
Router.post("/createUpHotel", guestAuthentication, createUpHotel);
Router.post("/addUpRoom", upload.array("hotelRoomImage"), addUpRoom);
Router.post("/searchingHotel/:id", searchingHotelById);
Router.post("/RoomAvailabilityCheck", RoomAvailabilityCheck);
Router.post("/deleteRoom/:id", deleteRoom);
Router.post("/hotelBooking", hotelBooking);
Router.post("/guest/cancleBooking", cencelHotel);
Router.post("/user/hotel/addrev", addRev);
Router.post("/booking/approveBooking", approveBooking);
Router.post("/user/hotel/allRev/:hotelId", findRev);
Router.post("/Owner/myBooking", findBookedOwnerHotel);
Router.post("/guest/myBooking", findBookedGuestHotel);
Router.post("/fromUserSide/getBookedList", bookedHotel);
Router.post("/bookingHistoryOFUser/:UserId", bookingHistoryOFUser);
Router.post("/vi/allHotels", guestAuthentication, findHotelsOfOwner);
Router.post("/vi/deleteHotel", guestAuthentication, deleteHotelByOwner);
Router.post("/vi/hotelOwnerInfo", guestAuthentication, hotelOwnerInfo);
module.exports = Router;
