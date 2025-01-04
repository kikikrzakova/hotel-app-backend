const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
// allows us to fetch data from react app
const cors = require("cors");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const {
  getAllBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  Booking
} = require("./bookings");
const { getAllRooms, createRoom, updateRoom, deleteRoom, Room } = require("./rooms");


const bookingRouter = express.Router();
const roomRouter = express.Router();
const app = express();
app.use(cors());
app.use(express.json());
dotenv.config({ path: "./config.env" });
const DB = process.env.DATABASE.replace("<db_password>", process.env.PASSWORD);
mongoose.connect(DB).then(console.log("Connection successful"));
// console.log(process.env);

bookingRouter.route("/").get(getAllBookings).post(createBooking);
bookingRouter
  .route("/:id")
  .get(getBooking)
  .patch(updateBooking)
  .delete(deleteBooking);

roomRouter.route("/").get(getAllRooms).post(upload.single("image"), createRoom);
roomRouter
  .route("/:id")
  .patch(upload.single("image"), updateRoom)
  .delete(deleteRoom);

app.use("/bookings", bookingRouter);
app.use("/rooms", roomRouter);

app.get("/booking/", async (req, res) => {
  const { startDate, endDate, guests } = req.query;
  console.log(startDate, endDate, guests);
  try {
    const query = {
      $and: [
        { checkIn: { $lte: new Date(endDate).toISOString() } },
        { checkOut: { $gte: new Date(startDate).toISOString() } },
      ],
    };
    const overlappingBookings = await Booking.find(query);
    // find bookings where the booked dates overlap with the required dates
    const bookedRooms = [
      ...new Set(overlappingBookings.map((booking) => booking.room)),
    ];
    console.log("booked rooms: ", bookedRooms, `${bookedRooms ? typeof bookedRooms[0]: ""}`)
    console.log("Room: ", Room)
    // find all rooms that are not booked during the required dates
    const availableRooms = await Room.find(
      {number : {$nin: [...bookedRooms]}}
    )
    console.log(overlappingBookings, bookedRooms,availableRooms);

    res.status(200).json({ status: "success", data: { bookedRooms } });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}` );
});
