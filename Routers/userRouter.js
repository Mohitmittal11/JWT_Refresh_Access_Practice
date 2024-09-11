const express = require("express");
const router = express.Router();
const { employeeAuth } = require("../middlewares/employeeauthmiddleware");
const userController = require("../Controller/user.controller");
router.post("/register", userController.addUserData);
router.get("/getUser/:id", employeeAuth, userController.getUserData);

router.post("/token", userController.refreshToken);
router.post("/login", userController.userLogin);

module.exports = router;
