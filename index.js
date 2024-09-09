require("dotenv").config();
const express = require("express");
const app = express();
require("./Configuration/mongodbConnection");
const commonRoute = require("./Routers/index");

app.get("/", async (req, res) => {
  res.send("Hello world");
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api", commonRoute);

app.listen(process.env.PORT, () => {
  console.log(`Server is running at port ${process.env.PORT} `);
});
