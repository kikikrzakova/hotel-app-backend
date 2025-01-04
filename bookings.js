const mongoose = require("mongoose");
const bookingSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  passport: { type: String, required: true },
  birthday: { type: Date, required: true },
  guests: { type: Number, required: true, min: 1 },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  paid: { type: Boolean, default: false },
  checkedIn: { type: Boolean, default: false },
  room: { type: Number, required: true },
  total: { type: Number, min: 0, default: 0 },
  checkedOut: { type: Boolean, default: false },
});

const Booking = mongoose.model("Booking", bookingSchema);

async function getAllBookings(req, res) {
  try {
    const bookings = await Booking.find();
    res.status(200).json({
      status: "success",
      data: { bookings },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: "Failed to fetch bookings",
    });
  }
}

async function getBooking(req, res) {
  try {
    const booking = await Booking.findById(req.params.id);
    res.status(200).json({
      status: "success",
      data: {
        booking,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: "Failed to fetch booking",
    });
  }
}

async function createBooking(req, res) {
  try {
    const newBooking = await Booking.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        newBooking,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "All fields required or invalid input",
    });
  }
}
async function updateBooking(req, res) {
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.status(200).json({
      status: "success",
      data: {
        updatedBooking,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Failed to update booking",
    });
  }
}
async function deleteBooking(req, res) {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: "Failed to delete",
    });
  }
}
exports.getAllBookings = getAllBookings;
exports.getBooking = getBooking;
exports.createBooking = createBooking;
exports.updateBooking = updateBooking;
exports.deleteBooking = deleteBooking;
exports.Booking = Booking;
