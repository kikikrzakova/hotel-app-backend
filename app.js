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
} = require("./bookings");
const { getAllRooms, createRoom } = require("./rooms");
const { updateRoom, deleteRoom } = require("./rooms");

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
  try {
    const query = {
      $and: [
        { checkIn: { $lte: new Date(endDate).toISOString() } },
        { checkOut: { $gte: new Date(startDate).toISOString() } },
      ],
    };

    const bookedRooms = await Booking.find(query);
    console.log(bookedRooms, endDate, startDate, query);
    const bookedRoomNumbers = [
      ...new Set(bookedRooms.map((booking) => booking.room)),
    ];

    res.status(200).json({ status: "success", data: { bookedRoomNumbers } });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
