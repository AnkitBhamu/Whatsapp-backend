const mongoose = require("mongoose");

const MsgsSchema = new mongoose.Schema(
  {
    sender_id: {
      type: String,
      required: true,
    },

    recv_id: {
      type: String,
      required: true,
    },

    msg: {
      type: String,
      required: true,
    },

    msgTime: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Msgs", MsgsSchema);
