const express = require("express");
const router = express.Router();
const adminController = require("../Controller/admin.controller");
const { AdminAuth } = require("../middlewares/adminauth");
router.post("/addAdmin", adminController.registerAdmin);
router.post("/login", adminController.loginAdmin);
router.patch(
  "/changeAdminPass/:id",
  AdminAuth,
  adminController.changeAdminPassword
);
router.patch("/forgotAdminPass", adminController.forgotPassAdmin);
router.patch("/logout/:id", AdminAuth, adminController.logoutAdmin);

module.exports = router;
