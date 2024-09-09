require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../Models/usermodal");

// Register Users

const addUserData = async (req, res) => {
  try {
    const requestBody = req.body;
    const isUserExist = await userModel.findOne({ email: requestBody?.email });
    // console.log("Is user exist is ", isUserExist);
    if (isUserExist !== null) {
      res.status(409).json({ message: "User is Already Exist" });
    } else {
      const hash = bcrypt.genSaltSync(12);
      const hashedPass = bcrypt.hashSync(requestBody?.password, hash);
      // console.log("comparable password is ", comparablePass);
      requestBody.password = hashedPass;
      console.log("User info to save data in database is ", requestBody);
      const saveUserDatabase = await userModel.create(req.body);
      if (saveUserDatabase) {
        res.status(200).json({
          statusCode: 200,
          message: "Data submitted successfully",
          data: saveUserDatabase,
        });
      }
    }
  } catch (err) {
    res.json({ message: err.message });
  }
};

const getUserData = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log("User id is", userId);
    const getUserData = await userModel.findOne({ _id: userId });
    if (getUserData === null || userId === undefined) {
      res.status(404).json({ message: "User Does not Exist" });
    } else {
      const token = jwt.sign({ _id: userId }, process.env.JWT_SECRET_KEY, {
        expiresIn: "10m",
      });
      console.log("Token is ", token);
      res.cookie("access_token", token).status(200).json({
        statusCode: 200,
        message: "Data Found Successfully",
        data: getUserData,
      });
    }
    // res.status(200).json({message:"Data found successfully"});
  } catch (err) {
    res.json({ message: err.message });
  }
};

const refreshToken = async (req, res) => {
  console.log("hiii");
  const access_Token = await req?.headers.cookie;
  console.log("Accesss token is ", access_Token.slice(13, access_Token.length));
  const refreshToken = access_Token.slice(13, access_Token.length);
  const isVerified = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);
  console.log("Is Verfied Data ", isVerified);
  if (isVerified && isVerified !== undefined && isVerified !== null) {
    const accessToken = jwt.sign(
      { _id: isVerified?._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "10m",
      }
    );
    return res.cookie(access_Token, accessToken).json({ accessToken });
  }
};

module.exports = {
  addUserData,
  getUserData,
  refreshToken,
};
