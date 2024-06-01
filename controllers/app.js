const CreateError = require("../errorCreate/CreateError");
const BookingHotel = require("../modals/BookingHotel");
const GuestModel = require("../modals/GuestModals");
const HotelModals = require("../modals/HotelModals");
const HotelRooomModal = require("../modals/RoomModals");
const HotelOwnerModel = require("../modals/HotelOwner");
const {
  sendEmail,
  sendEmailToNewlyCreatedHotelOwner,
  sendEmailToUserWithTheirPassword,
} = require("../sensitiveToken/SendEmail");
const { createJWT } = require("../sensitiveToken/createJsonWebToken");
const JWT = require("jsonwebtoken");
const {
  guestAuthentication,
} = require("../sensitiveToken/guestAuthentication");
const Review = require("../modals/ReviewHotel");
const {
  isGmail,
  isStrings,
  isMobileNumber,
  isNumbers,
} = require("../helpers/validationChecker");

const Welcome = (req, res) => {
  return res.status(200).json({
    message: "Everything Is Working Fine!",
    Status: true,
  });
};
const createAccount = async (req, res, next) => {
  const { name, nickname, dob, email, password, phone } = req.body;
  let userExist;
  if (!isStrings(name)) {
    return res
      .status(203)
      .json({ message: "Enter Correct Name!", status: true });
  }
  if (!isStrings(nickname)) {
    return res
      .status(203)
      .json({ message: "Enter Correct Nickname!", status: true });
  }
  if (!isGmail(email)) {
    return res
      .status(203)
      .json({ message: "Enter Correct Email!", status: true });
  }
  if (password == "" || password?.length <= 4) {
    return res
      .status(203)
      .json({ message: "Enter Strong Password", status: true });
  }
  if (!isNumbers(phone)) {
    return res
      .status(203)
      .json({ message: "Enter Correct Phone Number!", status: true });
  }
  try {
    userExist = await GuestModel.findOne({ phone });
    if (
      await GuestModel.exists({ $or: [{ phone: phone }, { email: email }] })
    ) {
      return res.status(203).json({
        message:
          "User Already Exist!. Please Change Your New Email & Phone Number",
        status: true,
      });
    }
    const Guest = new GuestModel({
      name,
      nickname,
      dob,
      email: email.toLowerCase(),
      phone,
      password,
    });
    await Guest.save();
    const token = createJWT(
      { id: Guest._id },
      process.env.JWTSecurityCode,
      "10y"
    );
    return res.status(200).json({ message: "User Created", token });
  } catch (error) {
    console.log(error);
    next(CreateError(error.message, 500));
  }
};
const createAccWithEmailPass = async (req, res, next) => {
  const { email, password } = req.body;

  if (!isGmail(email)) {
    return res.status(203).json({ message: "Invalid Email", status: true });
  }

  if (password === "") {
    return res
      .status(203)
      .json({ message: "Please Enter Your Password", status: true });
  }
  try {
    const existingUser = await GuestModel.exists({
      $and: [{ email: email.toLowerCase() }, { password: password }],
    });
    if (existingUser) {
      const token = createJWT(
        { id: existingUser._id },
        process.env.JWTSecurityCode,
        "10y"
      );
      return res.status(200).json({ message: "User Founded!", token });
    } else {
      return res
        .status(203)
        .json({ message: "Invalid Credentials!", status: false });
    }
  } catch (error) {
    next(CreateError(error.message, 500));
  }
};
const createNewPass = async (req, res, next) => {
  const { phone, email, password } = req.body;
  const userId = req.user;
  if (!phone && !email)
    return res.status(400).json({ message: "Phone or email is required" });
  if (!password)
    return res.status(400).json({ message: "Password is required" });
  try {
    const UpdatedUser = await GuestModel.findByIdAndUpdate(userId, {
      $set: { password: password },
    });
    const token = createJWT(
      UpdatedUser._id,
      process.env.JWTSecurityCode,
      "10y"
    );
    return res
      .status(200)
      .json({ message: "User Created Successfully", token });
  } catch (error) {
    next(CreateError(error.message, 500));
  }
};
const updateUserProfile = async (req, res, next) => {
  const { name, email, nickname } = req.body;
  const userId = req.user;
  try {
    const UpdatedUser = await GuestModel.findByIdAndUpdate(
      userId,
      {
        $set: { name: name, nickname: nickname },
      },
      { new: true }
    );
    return res.status(200).send(UpdatedUser);
  } catch (error) {
    console.log(error);
    next(CreateError(error.message, 500));
  }
};
const forgetPassword = async (req, res, next) => {
  const { email, isUserSide } = req.body;
  if (!isGmail(email))
    return res.status(203).json({ status: false, message: "Invalid Email!" });
  const modal = isUserSide ? GuestModel : HotelOwnerModel;
  try {
    const existingUser = await modal.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      await sendEmailToUserWithTheirPassword(
        email.toLowerCase(),
        "Forgeted Password",
        existingUser.password
      );
      return res.status(200).json({ message: "Please Check Your Email" });
    } else {
      return res
        .status(203)
        .json({ message: "Guest Not Found!", status: false });
    }
  } catch (error) {
    console.log(error);
    next(CreateError(error.message, 500));
  }
};
const getUserInfo = async (req, res, next) => {
  const userId = req.user;
  try {
    const user = await GuestModel.findById(userId);
    return res.status(200).send(user);
  } catch (error) {
    next(CreateError(error.message, 500));
  }
};
const hotelOwnerLogin = async (req, res, next) => {
  const { email, password } = req.body;
  if (!isGmail(email))
    return res.status(203).json({ status: false, message: "Invalid Email!" });
  try {
    const user = await HotelOwnerModel.findOne({
      $and: [{ email: email.toLowerCase(), password: password }],
    });

    if (user) {
      const token = createJWT(
        { id: user._id },
        process.env.JWTSecurityCode,
        "10y"
      );
      return res.status(200).json({ user, token });
    }
    return res
      .status(203)
      .json({ status: false, message: "Check Your Credentials!" });
  } catch (error) {
    console.log(error);
    next(CreateError(error.message, 500));
  }
};
const editProfile = async (req, res, next) => {
  const userId = req.user;
  const { name, email, nickName } = req.body;
  try {
    const updatedUser = await GuestModel.findByIdAndUpdate(
      userId,
      {
        name,
        nickName,
      },
      { new: true }
    );
    return res.status(200).send(updatedUser);
  } catch (error) {
    next(CreateError(error.message, 500));
  }
};
const createHotel = async (req, res, next) => {
  const {
    ownerName,
    email,
    pin,
    password,
    phone,
    stars,
    hotelName,
    hotelPhone,
    address,
    city,
    state,
    totalRooms,
    country,
    HotelLocation,
    description,
    charge,
    facilities,
    details,
  } = req.body;
  if (!isStrings(ownerName)) {
    return res
      .status(203)
      .json({ message: "Enter Correct Owner Name!", status: true });
  }
  if (!isGmail(email)) {
    return res
      .status(203)
      .json({ message: "Invalid Gmail Address!", status: true });
  }
  if (password == "") {
    return res.status(203).json({ message: "Invalid Password!", status: true });
  }
  if (!isMobileNumber(phone)) {
    return res
      .status(203)
      .json({ message: "Invalid Phone Number!", status: true });
  }
  if (!hotelName) {
    return res
      .status(203)
      .json({ message: "Hotel Name Required", status: true });
  }

  if (!country || !isStrings(country)) {
    return res
      .status(203)
      .json({ message: "Please Select Country Name!", status: true });
  }
  if (!state || !isStrings(state)) {
    return res
      .status(203)
      .json({ message: "Please Select state Name!", status: true });
  }
  if (!city || !isStrings(city)) {
    return res
      .status(203)
      .json({ message: "Please Select city Name!", status: true });
  }

  if (
    !stars ||
    stars === "" ||
    !isNumbers(stars) ||
    (stars != 1 &&
      stars != 2 &&
      stars != 3 &&
      stars != 4 &&
      stars != 5 &&
      stars != 7)
  ) {
    return res.status(203).json({
      message: "Please Enter Your Hotel Type like '1', '2', '3', OR '7'!",
      status: true,
    });
  }
  if (!totalRooms || !isNumbers(totalRooms) || totalRooms == "") {
    return res.status(203).json({
      message: "Enter Your Total Numbers Of Rooms Available!",
      status: true,
    });
  }

  if (!address || address == "") {
    return res
      .status(203)
      .json({ message: "Please Enter Your Hotel Address!", status: true });
  }
  if (!hotelPhone || !isMobileNumber(hotelPhone)) {
    return res.status(203).json({
      message: "Please Enter Your Hotel Contact Number!",
      status: true,
    });
  }
  if (!isNumbers(charge)) {
    return res.status(203).json({
      message: "Please Enter Your One Night Hotel Charge!",
      status: true,
    });
  }
  if (!details || details.length === 0) {
    return res.status(203).json({
      message: "Please Select Atleast One Details!",
      status: true,
    });
  }
  if (!facilities || facilities.length === 0) {
    return res.status(203).json({
      message: "Please Select Atleast One Facilities!",
      status: true,
    });
  }
  if (!HotelLocation || HotelLocation == "") {
    return res.status(203).json({
      message: "Please Enter Your Map Location Link",
      status: true,
    });
  }
  try {
    if (
      await HotelOwnerModel.exists({
        $or: [{ email: email.toLowerCase() }, { phone: phone }],
      })
    ) {
      console.log("existed");
      return res.status(203).json({
        message: "Hotel already existed With Your Entered Email OR Mobile No.",
        status: false,
      });
    } else {
      console.log("no existed");
      const isValidEmail = sendEmailToNewlyCreatedHotelOwner(
        email,
        "Hotel Creation",
        {
          name: hotelName,
          email: email.toLowerCase(),
          phone: phone,
          password: password,
        }
      );
      if (!isValidEmail) {
        return res
          .status(400)
          .json({ message: "Email not valid", status: false });
      }
      // create Owner Firstly
      const owner = new HotelOwnerModel({
        name: ownerName,
        email: email.toLowerCase(),
        phone: phone,
        password: password,
      });
      await owner.save();
      // create hotel
      const hotel = new HotelModals({
        owners: owner._id,
        hotelName,
        pin,
        totalRooms,
        stars,
        hotelPhone,
        country,
        city,
        state,
        hotelLocation: HotelLocation,
        description,
        details,
        facilities,
        charge,
        address,
      });
      await hotel.save();
      owner.$set("hotel", hotel._id);
      await owner.save();
      const token = createJWT(
        { id: owner._id },
        process.env.JWTSecurityCode,
        "3y"
      );
      res
        .status(200)
        .json({ message: "Hotel created successfully", status: true, token });
    }
  } catch (error) {
    console.log(error);
    next(CreateError(error.message, 500));
  }
};
const searchingHotel = async (req, res, next) => {
  try {
    const { HotelName, city, state, query } = req.query;
    console.log(req.query);
    let hotel;
    let searchCriteria = {};
    if (query) {
      searchCriteria = {
        $or: [
          { hotelName: { $regex: new RegExp(query, "i") } },
          { city: { $regex: new RegExp(query, "i") } },
          { state: { $regex: new RegExp(query, "i") } },
          { address: { $regex: new RegExp(query, "i") } },
        ],
      };
    } else {
      searchCriteria = {
        $or: [
          { hotelName: { $regex: new RegExp(HotelName, "i") } },
          { city: { $regex: new RegExp(city, "i") } },
          { state: { $regex: new RegExp(state, "i") } },
        ],
      };
    }
    hotel = await HotelModals.find(searchCriteria).limit(30);
    const hotelPromises = hotel.map(async (item) => {
      const allRoomsOfthisHotel = await HotelRooomModal.find({
        hotelId: item._id,
      });
      return { ...item._doc, allRoomsOfthisHotel };
    });
    // Wait for all promises to resolve
    const hotelsWithRooms = await Promise.all(hotelPromises);
    console.log(hotelsWithRooms);
    res.status(200).send(hotelsWithRooms);
  } catch (error) {
    console.log(error);
    next(CreateError(error.message, 500));
  }
};
const searchingHotelForBookMark = async (req, res, next) => {
  try {
    const { allBookMarkedId } = req.body;
    let hotel;
    hotel = await HotelModals.find({ _id: { $in: allBookMarkedId } });
    const hotelPromises = hotel.map(async (item) => {
      const allRoomsOfthisHotel = await HotelRooomModal.find({
        hotelId: item._id,
      });
      return { ...item._doc, allRoomsOfthisHotel };
    });
    // Wait for all promises to resolve
    const hotelsWithRooms = await Promise.all(hotelPromises);

    res.status(200).send(hotelsWithRooms);
  } catch (error) {
    console.log(error);
    next(CreateError(error.message, 500));
  }
};
const citiesHotels = async (req, res, next) => {
  try {
    const { city, state } = req.body;

    // Find hotels based on city or state
    const hotels = await HotelModals.find({
      $or: [{ city }, { state: "Maharashtra" }], // Assuming "Maharashtra" is a fallback state
    }).limit(20);

    let room = [];

    // Fetch rooms for each hotel
    for (let hotel of hotels) {
      const roomOfHotel = await HotelRooomModal.find({
        hotelId: hotel._id,
      })
        .populate({ path: "hotelId", modal: "Hotel" })
        .limit(2); // Limit to 2 rooms per hotel
      room = [...room, ...roomOfHotel];
    }

    res.status(200).send(room);
  } catch (error) {
    console.error(error);
    next(CreateError(error.message, 500));
  }
};

const searchingRoomForThisHotel = async (req, res, next) => {
  const { hotelId } = req.params;
  console.log(hotelId);
  try {
    let rooms;
    rooms = await HotelRooomModal.find({
      hotelId,
    });
    res.status(200).send(rooms);
  } catch (error) {
    console.log(error);
    next(CreateError(error.message, 500));
  }
};
const createUpHotel = async (req, res, next) => {
  const {
    hotelName,
    pin,
    hotelPhone,
    city,
    state,
    stars,
    country,
    totalRooms,
    HotelLocation,
    description,
    details,
    facilities,
    charge,
    address,
  } = req.body.userData;
  const ownerId = req.user;
  const { hotelId } = req.body; // Destructure hotelId from req.body
  console.log(req.body);
  if (!hotelName) {
    return res
      .status(203)
      .json({ message: "Hotel Name Required", status: true });
  }
  if (!hotelId) {
    if (!country || !isStrings(country)) {
      return res
        .status(203)
        .json({ message: "Please Select Country Name!", status: true });
    }
    if (!state || !isStrings(state)) {
      return res
        .status(203)
        .json({ message: "Please Select state Name!", status: true });
    }
    if (!city || !isStrings(city)) {
      return res
        .status(203)
        .json({ message: "Please Select city Name!", status: true });
    }
  }
  if (!totalRooms || totalRooms == "" || !isNumbers(totalRooms)) {
    return res.status(203).json({
      message: "Enter Your Total Numbers Of Rooms Available!",
      status: true,
    });
  }
  if (
    !stars ||
    stars === "" ||
    !isNumbers(stars) ||
    (stars != 1 &&
      stars != 2 &&
      stars != 3 &&
      stars != 4 &&
      stars != 5 &&
      stars != 7)
  ) {
    return res.status(203).json({
      message: "Please Enter Your Hotel Type like '1', '2', '3', OR '7'!",
      status: true,
    });
  }

  if (!address || address == "") {
    return res
      .status(203)
      .json({ message: "Please Enter Your Hotel Address!", status: true });
  }
  if (!description || description == "") {
    return res
      .status(203)
      .json({ message: "Please Enter Your Hotel description!", status: true });
  }
  if (!hotelPhone || !isMobileNumber(hotelPhone)) {
    return res.status(203).json({
      message: "Please Enter Your Hotel Contact Number!",
      status: true,
    });
  }
  if (!isNumbers(charge)) {
    return res.status(203).json({
      message: "Please Enter Your One Night Hotel Charge!",
      status: true,
    });
  }
  if (!details || details.length === 0) {
    return res.status(203).json({
      message: "Please Select Atleast One Details!",
      status: true,
    });
  }
  if (!facilities || facilities.length === 0) {
    return res.status(203).json({
      message: "Please Select Atleast One Facilities!",
      status: true,
    });
  }
  if (!HotelLocation || HotelLocation == "") {
    return res.status(203).json({
      message: "Please Enter Your Map Location Link",
      status: true,
    });
  }
  if (!HotelLocation || HotelLocation == "") {
    return res
      .status(203)
      .json({ message: "Please Enter Your Hotel Location!", status: true });
  }
  try {
    let hotel;
    if (hotelId) {
      // Update existing hotel if hotelId is present
      hotel = await HotelModals.findByIdAndUpdate(
        hotelId,
        {
          hotelName,
          pin,
          hotelPhone,
          country,
          city,
          stars,
          totalRooms,
          state,
          hotelLocation: HotelLocation,
          description,
          details,
          facilities,
          charge,
          address,
        },
        { new: true }
      );
    } else {
      // Create a new hotel if hotelId is not present
      hotel = new HotelModals({
        hotelName,
        pin,
        hotelPhone,
        city,
        state,
        stars,
        totalRooms,
        hotelLocation: HotelLocation,
        description,
        details,
        country,
        facilities,
        charge,
        address,
        owners: [ownerId],
      });
      await hotel.save();
    }

    res.status(200).json(hotel);
  } catch (error) {
    console.log(error);
    next(CreateError("error", 503));
  }
};
const addUpRoom = async (req, res, next) => {
  let { roomType, noOfRooms, roomPrice, roomDescription, selectedFacilities } =
    req.body;
  try {
    if (!noOfRooms || noOfRooms === "") {
      return res
        .status(203)
        .json({ message: "Check Your No Of Rooms Field!", status: true });
    }
    if (noOfRooms.length === 1) {
      noOfRooms = [noOfRooms];
    } else {
      noOfRooms = noOfRooms?.map((item, idx) => {
        return parseInt(item);
      }) || [noOfRooms];
    }
  } catch (error) {
    return res
      .status(203)
      .json({ message: "Please Restart Your App!", status: true });
  }

  const { hotelId } = req.body;
  const image = req.files;

  const imageUrls = image?.map((item, idx) => {
    return item?.filename;
  });

  if (!roomType || roomType === "") {
    return res
      .status(203)
      .json({ message: "Room Type Required", status: true });
  }
  if (!noOfRooms || noOfRooms.length == 0) {
    return res
      .status(203)
      .json({ message: "No Of Room Required!", status: true });
  }
  if (Array.isArray(noOfRooms) && noOfRooms.length > 0) {
    let roomSet = new Set();
    for (let i = 0; i < noOfRooms.length; i++) {
      if (noOfRooms[i] === "" || !isNumbers(noOfRooms[i])) {
        return res
          .status(203)
          .json({ message: "Correct Room No Required!", status: true });
      }
      if (roomSet.has(noOfRooms[i])) {
        return res.status(203).json({
          message: "All room numbers must be different!",
          status: true,
        });
      }

      roomSet.add(noOfRooms[i]);
    }
  }

  if (!roomPrice || !isNumbers(roomPrice) || roomPrice === "") {
    return res
      .status(203)
      .json({ message: "Room Charge Required!", status: true });
  }
  if (!roomDescription || roomDescription === "") {
    return res
      .status(203)
      .json({ message: "Room Description Required!", status: true });
  }
  if (!selectedFacilities || selectedFacilities.length == 0) {
    return res
      .status(203)
      .json({ message: "Select One Room Facilities Atleast!", status: true });
  }
  if (!imageUrls || imageUrls?.length == 0) {
    return res.status(203).json({
      message: "Upload Atleast One Image Of Your Room!",
      status: true,
    });
  }

  try {
    const hotel = await HotelModals.findById(hotelId);
    const rooms = await HotelRooomModal.find({ hotelId });

    if (
      hotel.totalRooms == rooms.length ||
      Number(hotel.totalRooms) < rooms.length + noOfRooms?.length
    ) {
      return res.status(203).json({
        message: `You can Not Add More Than ${hotel?.totalRooms} Room! Please Edit Your Hotel ${hotel?.hotelName} `,
        status: true,
      });
    }
    for (let i = 0; i < noOfRooms.length; i++) {
      const roomNo = noOfRooms[i];
      let roomExists = false;
      for (let j = 0; j < rooms.length; j++) {
        if (rooms[j].roomNo === roomNo) {
          roomExists = true;
          return res.status(203).json({
            message: `You cannot add Room No ${rooms[j].roomNo} because you already have this room with type ${rooms[j].roomType}`,
            status: true,
          });
          break;
        }
      }
      if (!roomExists) {
        hotelRoom = new HotelRooomModal({
          roomType,
          roomNo,
          imageUrls,
          roomPrice,
          roomDescription,
          selectedFacilities,
          hotelId,
        });
        await hotelRoom.save();
      }
    }
    res
      .status(200)
      .json({ message: "Rooms added successfully!", status: true });
  } catch (error) {
    console.log(error);
    next(CreateError("error", 503));
  }
};
const searchingHotelById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const hotel = await HotelModals.findById(id);
    if (hotel) {
      const allRoomsOfThisHotel = await HotelRooomModal.find({ hotelId: id });
      const data = { ...hotel._doc, allRoomsOfThisHotel };
      console.log(data);
      return res.status(200).send(data);
    } else {
      return res.status(404).send({ message: "Hotel not found" });
    }
  } catch (error) {
    return next(CreateError(error.message, 500));
  }
};
const RoomAvailabilityCheck = async (req, res, next) => {
  const { selectedRooms, dates } = req.body;

  if (!dates || Object.keys(dates).length === 0)
    return res.status(203).json({
      message: "Please Select Atleast One Date!",
      charge: 0,
      status: true,
    });
  if (!selectedRooms || selectedRooms.length === 0) {
    return res.status(203).json({
      message: "Please Select Atleast One Room!",
      charge: 0,
      status: true,
    });
  }
  try {
    const NotAvailableRoomNo = [];
    const availableRoomNo = [];
    for (const [date, value] of Object.entries(dates)) {
      for (const roomId of selectedRooms) {
        const isAlreadyBooked = await BookingHotel.findOne({
          roomId: roomId,
          dates: date,
          isCanceled: false,
        });
        if (isAlreadyBooked) {
          const roomDetails = await HotelRooomModal.findById(roomId);

          NotAvailableRoomNo.push({
            roomNo: roomDetails.roomNo,
            price: roomDetails.roomPrice,
            date,
          });
        } else {
          const roomDetails = await HotelRooomModal.findById(roomId);
          availableRoomNo.push({
            roomNo: roomDetails.roomNo,
            price: roomDetails.roomPrice,
            date,
          });
        }
      }
    }

    if (NotAvailableRoomNo.length > 0) {
      const message = NotAvailableRoomNo.map((item) => {
        return `Room No ${item.roomNo} is not available on ${item.date}`;
      });
      return res.status(203).json({
        message: message,
        status: false,
        charge: 0,
        isAvailable: false,
      });
    } else {
      let price = 0;
      availableRoomNo.map((item) => {
        price = price + item.price;
      });

      return res.status(200).json({
        message: `All Selected Room Is Availble On selected Date`,
        isAvailable: true,
        charge: price,
        status: true,
      });
    }
  } catch (error) {
    console.log(error);
    return next(CreateError(error.message, 500));
  }
};
const deleteRoom = async (req, res, next) => {
  const { id } = req.params;
  try {
    const hotel = await HotelRooomModal.findByIdAndDelete(id);
    if (hotel) {
      return res
        .status(200)
        .send({ message: "Room Deleted Successfully!", status: true });
    } else {
      return res
        .status(203)
        .json({ message: "Room Not Found!", status: false });
    }
  } catch (error) {
    return next(CreateError(error.message, 500));
  }
};
const bookingHistoryOFUser = async (req, res, next) => {
  const { UserId } = req.params;
  try {
    const bookings = await BookingHotel.find({ guest: UserId }).populate(
      "hotel"
    );
    res.status(200).send(bookings);
  } catch (error) {
    next(CreateError(error.message, 500));
  }
};
const hotelBooking = async (req, res) => {
  const {
    hotelId,
    dates,
    totalPerson,
    selectedRooms,
    price,
    personList,
    userId,
  } = req.body;
  try {
    const NotAvailableRoomNo = [];
    const availableRoomNo = [];
    for (const [date, value] of Object.entries(dates)) {
      for (const roomId of selectedRooms) {
        const isAlreadyBooked = await BookingHotel.findOne({
          roomId: roomId,
          dates: date,
          isCanceled: false,
        });
        if (isAlreadyBooked) {
          const roomDetails = await HotelRooomModal.findById(roomId);

          NotAvailableRoomNo.push({
            roomNo: roomDetails.roomNo,
            price: roomDetails.roomPrice,
            date,
          });
        } else {
          const roomDetails = await HotelRooomModal.findById(roomId);
          availableRoomNo.push({
            roomNo: roomDetails.roomNo,
            price: roomDetails.roomPrice,
            date,
          });
        }
      }
    }

    if (NotAvailableRoomNo.length > 0) {
      const message = NotAvailableRoomNo.map((item) => {
        return `Room No ${item.roomNo} is not available on ${item.date}`;
      });
      return res.status(203).json({
        message: message,
        status: false,
        charge: 0,
        isAvailable: false,
      });
    }

    const decode = JWT.verify(userId, process.env.JWTSecurityCode);
    if (!decode.id) {
      return res.status(203).json({
        message: "Guest Id Is Not Found",
        status: false,
        charge: 0,
        isAvailable: false,
      });
    }
    for (const [date, value] of Object.entries(dates)) {
      for (const roomId of selectedRooms) {
        const isAlreadyBooked = await BookingHotel.findOne({
          roomId: roomId,
          dates: date,
          isCanceled: false,
        });
        if (!isAlreadyBooked) {
          const hotelDetails = await HotelModals.findById(hotelId);
          if (!hotelDetails) {
            res.status(203).json({
              message: "Not Booked Due To Hotel Not Found!",
              status: false,
            });
          }
          const booking = new BookingHotel({
            hotelId,
            dates: date,
            roomOwner: hotelDetails.owners,
            personList,
            roomId: roomId,
            guest: decode.id,
            isCanceled: false,
            charge: price,
          });
          await booking.save();
        }
      }
    }
    res.status(200).json({ message: "Booking Successfully!", status: true });
  } catch (error) {
    console.log(error);
    res.status(503).send("internal Error");
  }
};
const bookedHotel = async (req, res) => {
  const { userId } = req.body;
  const decode = JWT.verify(userId, process.env.JWTSecurityCode);
  try {
    const HotelBooked = await BookingHotel.find({ userId: decode.id })
      .populate({
        path: "hotelId",
        model: "Hotel",
      })
      .populate({
        path: "userId",
        model: "Guest",
      });
    res.status(200).send(HotelBooked); // Sending the populated data
  } catch (error) {
    res.status(503).send("Internal Error");
  }
};
const cencelHotel = async (req, res) => {
  const { hotelId, token } = req.body;
  const decode = JWT.verify(token, process.env.JWTSecurityCode);
  try {
    const deletedBooking = await BookingHotel.findByIdAndUpdate(hotelId, {
      isCanceled: true,
    });
    if (deletedBooking) {
      return res
        .status(200)
        .json({ message: "Hotel Cencelled Successfully!", status: true });
    }
    return res
      .status(203)
      .json({ message: "Booked Room Is Not Found!", status: false });
  } catch (error) {
    res.status(503).send("Internal Error");
  }
};
const addRev = async (req, res) => {
  const { hotelId, userId, revText } = req.body;

  try {
    const decode = JWT.verify(userId, process.env.JWTSecurityCode);
    const user = decode.id;
    // Check if a review from the same user for the same hotel already exists
    const existingReview = await Review.findOne({ hotelId, user });
    if (existingReview) {
      return res.status(203).json({
        message: "You have already reviewed this hotel.",
        status: false,
      });
    }
    // Create a new review instance
    const newReview = new Review({
      hotelId,
      user,
      revText,
    });
    // Save the review to the database
    await newReview.save();
    // Update the hotel document to include the new review ID
    await HotelModals.findByIdAndUpdate(hotelId, {
      $push: { reviews: newReview._id },
    });

    res.status(200).json({ message: "Review Added!", status: true });
  } catch (error) {
    console.error(error);
    res.status(503).send("Internal Error");
  }
};
const findRev = async (req, res) => {
  const { hotelId } = req.params;

  try {
    const existingReview = await Review.find({ hotelId }).populate({
      path: "user",
      model: "Guest",
    });
    if (existingReview) {
      return res.status(200).send(existingReview);
    }
    res.status(203).json({ message: "Review Not Found!", status: false });
  } catch (error) {
    console.error(error);
    res.status(503).send("Internal Error");
  }
};
const findBookedOwnerHotel = async (req, res) => {
  const { token } = req.body;
  const decode = JWT.verify(token, process.env.JWTSecurityCode);
  try {
    const allHotelsOfThisOwner = await BookingHotel.find({
      roomOwner: decode.id,
    })
      .populate({
        path: "hotelId",
        modal: "Hotel",
      })
      .populate({
        path: "roomId",
        modal: "HotelRoom",
      })
      .populate({
        path: "guest",
        modal: "Guest",
      });

    if (allHotelsOfThisOwner.length > 0) {
      return res.status(200).send(allHotelsOfThisOwner);
    }
    res.status(203).json({ message: "Hotel Not Found!", status: false });
  } catch (error) {
    console.error(error);
    res.status(503).send("Internal Error");
  }
};
const findBookedGuestHotel = async (req, res) => {
  const { token } = req.body;
  const decode = JWT.verify(token, process.env.JWTSecurityCode);
  try {
    const bokedHotels = await BookingHotel.find({
      guest: decode.id,
    })
      .populate({
        path: "hotelId",
        model: "Hotel",
      })
      .populate({
        path: "guest",
        model: "Guest",
      })
      .populate({
        path: "roomId",
        modal: "HotelRoom",
      })
      .exec();
    if (bokedHotels) {
      console.log(bokedHotels);
      return res.status(200).send(bokedHotels);
    }
    res
      .status(203)
      .json({ message: "You Don't Have Any Booked Hotel!", status: false });
  } catch (error) {
    console.error(error);
    res.status(503).send("Internal Error");
  }
};
const findHotelsOfOwner = async (req, res, next) => {
  const ownerId = req.user;

  let hotels;
  try {
    hotels = await HotelModals.find({ owners: ownerId });
    if (hotels) {
      return res.status(200).send(hotels);
    }
    res.status(404).send("Hotels Not Found");
  } catch (error) {
    next(new Error(error.message));
  }
};
const deleteHotelByOwner = async (req, res, next) => {
  const ownerId = req.user; // Assuming req.user contains the ID of the authenticated user
  const { hotelId } = req.body;
  console.log(hotelId);
  try {
    // Attempt to find and delete the hotel
    const deletedHotel = await HotelModals.findOneAndDelete({
      owners: ownerId,
      _id: hotelId,
    });
    // Check if a hotel was found and deleted
    if (deletedHotel) {
      return res.status(200).json(deletedHotel); // Send deleted hotel object as JSON
    } else {
      return res.status(404).send("Hotel Not Found or Not Authorized"); // Hotel not found or not authorized
    }
  } catch (error) {
    // Handle any errors
    return next(new Error(error.message));
  }
};
const hotelOwnerInfo = async (req, res, next) => {
  const ownerId = req.user;

  let hotels;
  try {
    hotels = await HotelOwnerModel.findById(ownerId);
    if (hotels) {
      return res.status(200).send(hotels);
    }
    res.status(404).send("Hotels Not Found");
  } catch (error) {
    next(new Error(error.message));
  }
};
const approveBooking = async (req, res, next) => {
  const bookingID = req.body.bookingId;

  try {
    // Update the booking to mark it as approved
    const updatedBooking = await BookingHotel.findByIdAndUpdate(
      bookingID,
      { $set: { isAprooved: true } },
      { new: true } // To return the updated document
    );

    if (updatedBooking) {
      // If the booking was found and updated successfully
      return res.status(200).json({ message: "Booking Approved!", status: true });
    } else {
      // If the booking was not found
      return res.status(203).json({ message: "Booking Not Found!", status: false });
    }
  } catch (error) {
    // Handle errors
    next(new Error(error.message));
  }
};

module.exports = {
  findHotelsOfOwner,
  approveBooking,
  deleteRoom,
  Welcome,
  findBookedOwnerHotel,
  findBookedGuestHotel,
  RoomAvailabilityCheck,
  createAccount,
  hotelOwnerInfo,
  editProfile,
  addUpRoom,
  createUpHotel,
  searchingHotelForBookMark,
  hotelBooking,
  createNewPass,
  deleteHotelByOwner,
  getUserInfo,
  updateUserProfile,
  hotelOwnerLogin,
  bookedHotel,
  citiesHotels,
  addRev,
  searchingHotel,
  cencelHotel,
  searchingRoomForThisHotel,
  createHotel,
  findRev,
  forgetPassword,
  createAccWithEmailPass,
  searchingHotelById,
  bookingHistoryOFUser,
};
