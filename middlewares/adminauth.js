const jwt = require("jsonwebtoken");
const adminModal = require("../Models/adminModal");
require("dotenv").config();

const AdminAuth = async (req, res, next) => {
  try {
    const isVerified = jwt.verify(req.headers.auth, process.env.JWT_SECRET_KEY);
    console.log("Is Verified is ", isVerified);
    if (isVerified === null) {
      return res.json({ message: "Unauthorize Access" });
    } else {
      const adminData = await adminModal.findOne({
        email: isVerified?.email,
        token: req?.headers?.auth,
      });
      console.log("Admin Data is", adminData);
      if (adminData === null) {
        return res.status(401).json({ message: "UnAuthorized Access" });
      }
      next();
    }
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

module.exports = { AdminAuth };
