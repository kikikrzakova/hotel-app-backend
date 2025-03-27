const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

async function verifyUser(req, res) {
  const { username, password } = req.body;
  const user = await User.findOne({
    username: username,
    password: password,
  });
  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid username or password",
    });
  }

  res.status(200).json({
    status: "success",
    data: user._id,
  });
}

async function changePassword(req, res) {
  try {
    const data = await User.findOneAndUpdate(
      {
        _id: req.params.id,
      },
      { password: req.body.password }
    );
    if (!data) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }
    res.status(200).json({
      status: "success",
      message: "Password changed successfully",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to change password",
    });
  }
}

exports.verifyUser = verifyUser;
exports.changePassword = changePassword;
exports.User = User;
