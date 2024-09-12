require("dotenv").config();
const jwt = require("jsonwebtoken");

const genrateAccessToken = (value) => {
  console.log("Value is ", value);
  const user_access_token = jwt.sign(value, process.env.JWT_SECRET_KEY, {
    expiresIn: "1h",
  });
  return user_access_token;
};

const genrateRefreshToken = (value) => {
  console.log("Value is ", value);

  const user_refresh_token = jwt.sign(
    value,
    process.env.JWT_SECRET_KEY_REFRESH,
    {
      expiresIn: "60d",
    }
  );
  return user_refresh_token;
};

module.exports = { genrateAccessToken, genrateRefreshToken };
