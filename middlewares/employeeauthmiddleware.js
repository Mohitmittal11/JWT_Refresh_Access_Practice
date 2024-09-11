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
  console.log("Employee authentication is ", req.params.id);
  // console.log("Data is ", req.headers.auth);
  // const expiryTime = jwtDecode(req.headers.auth).exp;

  const isVarified = jwt.verify(req.headers.auth, process.env.JWT_SECRET_KEY);

  if (
    isVarified.email === "" ||
    isVarified.email === undefined ||
    isVarified.email === null
  ) {
    res.json({ message: "Unauthorized Access" });
  } else {
    next();
  }
};

module.exports = { employeeAuth };
