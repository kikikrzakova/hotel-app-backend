const mongoose = require("mongoose");
const {Room }= require("./rooms");

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

  
async function getAvailableBookings(req, res) {
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
    // console.log("booked rooms: ", bookedRooms, `${bookedRooms ? typeof bookedRooms[0]: ""}`)
    // console.log("Room: ", Room)
    // find all rooms that are not booked during the required dates
    const availableRooms = await Room.find(
      {number : {$nin: [...bookedRooms]}}
    )
    if (!availableRooms){
      return res.status(204).json({
        status: "fail",
        data: null,
      })
    }
    // console.log(availableRooms);

    // find all single rooms that satisfy the required capacity and are available
    const availableSingleRooms = availableRooms.filter((room) => room.capacity >= guests)
    
    
    // if there are single available rooms that can fit the required number of guests, we'll find a room with min capacity
    if (availableSingleRooms.length > 0){
      const bestRoom = availableSingleRooms.reduce((minRoom, room)=> {
        if (room.capacity < minRoom.capacity){
          console.log(room)
          return room
        } else return minRoom
      }, availableSingleRooms[0])
      return res.status(200).json({ status: "success", data:  [bestRoom] });
    }
    console.log("seems to be working fine until here")
    
    // if there are no single available rooms that can fit the required number of guests, we'll find a combination of rooms that can fit the required number of guests
    // sort the available rooms in ascending order to find a combination with min capacity
    const sortedAvailableRooms = availableRooms.sort((roomA,roomB)=>roomA.capacity - roomB.capacity);
    let totalCapacity = 0;
    const roomCombination = [];
    for (const room of sortedAvailableRooms) {
      totalCapacity += room.capacity;
      console.log(room);
      roomCombination.push(room);
      if (totalCapacity >= guests){
        break;
      }
    }
    if (totalCapacity < guests ){
      return res.status(204).json({
        status: "fail",
        message: "Not enough capacity for the number of guests",
      })
    
    } 
    return res.status(200).json({ status: "success", data:  roomCombination  });
    
    
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
}
exports.getAllBookings = getAllBookings;
exports.getBooking = getBooking;
exports.createBooking = createBooking;
exports.updateBooking = updateBooking;
exports.deleteBooking = deleteBooking;
exports.getAvailableBookings = getAvailableBookings;
exports.Booking = Booking;
