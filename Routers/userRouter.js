const express = require("express");
const router = express.Router();
const userController = require("../Controller/user.controller");
router.post("/add", userController.addUserData);
router.get("/getUser/:id", userController.getUserData);
router.post('/token', userController.refreshToken);

module.exports = router;
