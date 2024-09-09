require("dotenv").config();
const mongoose = require("mongoose");
const connectDatabase = mongoose
  .connect(`${process.env.DATABASEURL}`)
  .then(() => {
    console.log("Database connection is Established");
  })
  .catch((err) => {
    console.log("Databse connection Error", err);
  });
module.exports= connectDatabase;

