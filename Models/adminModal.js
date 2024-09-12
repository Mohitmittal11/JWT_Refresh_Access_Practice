const mongoose = require("mongoose");
const AdminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    contact_number: {
      type: String,
      required: true,
    },
    token:{
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("admin", AdminSchema);
