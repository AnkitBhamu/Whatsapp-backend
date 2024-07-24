const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    // password: { type: String, required: true },
    // contacts: { type: Array, default: [] },
    pendingmsgs: { type: Array, default: [] },
    profilePicture: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", userSchema);
