const mongoose = require("mongoose");
const tokenModal = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    access_token: {
      type: String,
      required: true,
    },
    refresh_token: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("token", tokenModal);