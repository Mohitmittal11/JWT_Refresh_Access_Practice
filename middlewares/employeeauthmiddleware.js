const jwt = require("jsonwebtoken");
require("dotenv").config();
const { jwtDecode } = require("jwt-decode");

// const genrateAccessToken = (value) => {
//   console.log("Value is ", value);
//   const user_access_token = jwt.sign(value, process.env.JWT_SECRET_KEY, {
//     expiresIn: "1h",
//   });
//   return user_access_token;
// };

const employeeAuth = async (req, res, next) => {
  try {
    const isVerified = jwt.verify(req.headers.auth, process.env.JWT_SECRET_KEY);
    next();
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

module.exports = { employeeAuth };
