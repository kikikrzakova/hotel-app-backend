const mongoose = require("mongoose");
const cloudinary = require("./cloudinaryConfig");
// we need the fs
const fs = require("fs");

const roomsSchema = new mongoose.Schema({
  image: {
    type: String,
  },
  number: { type: Number, required: true, unique: true },
  capacity: { type: Number, required: true, default: 2 },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
});

const Room = mongoose.model("Room", roomsSchema);
console.log("Room in rooms:", Room)
async function getAllRooms(req, res) {
  try {
    const rooms = await Room.find();
    res.status(200).json({
      status: "success",
      data: { rooms },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: "Failed to fetch rooms",
    });
  }
}

async function createRoom(req, res) {
  try {
    const newRoom = Object.assign({}, req.body);
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "hotel_rooms",
      });
      newRoom.image = result.secure_url;

      // Delete the file from the uploads file after upload
      //the file.path is 'uploads\\<filename>'
      fs.unlinkSync(req.file.path);
    }
    const room = await Room.create(newRoom);
    console.log("new room: ", newRoom);
    res.status(201).json({
      status: "success",
      data: { room },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Invalid data",
    });
  }
}

async function updateRoom(req, res) {
  console.log(req.body, req.file);
  try {
    // Create an object with the data from the request body, the received object is [Object: null prototype], which will cause problems with the update operation, because findByIdAndUpdate expects a plain object
    let updateData = Object.assign({}, req.body);
    console.log("updateData: ", updateData);

    // If a file was uploaded, process it with Cloudinary
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "hotel_rooms",
      });
      updateData.image = result.secure_url;

      // Delete the file from the uploads file after upload
      //the file.path is 'uploads\\<filename>'
      fs.unlinkSync(req.file.path);
    }

    const room = await Room.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      data: { room },
    });
  } catch (err) {
    // If there's an error and a file was uploaded, delete it
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    res.status(400).json({
      status: "fail",
      message: "Invalid data",
      error: err.message,
    });
  }
}

async function deleteRoom(req, res) {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: "Failed to delete room",
    });
  }
}

module.exports = { getAllRooms, createRoom, updateRoom, deleteRoom, Room };

