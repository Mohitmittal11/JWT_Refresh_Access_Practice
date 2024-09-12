require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../Models/usermodal");
const tokenModal = require("../Models/tokenmodal");
const { jwtDecode } = require("jwt-decode");

const genhashPass = (value) => {
  const hash = bcrypt.genSaltSync(12);
  const hashedPass = bcrypt.hashSync(value, hash);
  return hashedPass;
};

const verifyPass = (pass, hashpass) => {
  const isVarified = bcrypt.compareSync(pass, hashpass);
  return isVarified;
};
const checkTokenVarified = (value) => {
  const verifiedData = jwt.verify(value, process.env.JWT_SECRET_KEY_REFRESH);
  if (verifiedData !== null) {
    return true;
  }
  return false;
};
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
// Register Users
const addUserData = async (req, res) => {
  try {
    let requestBody = req.body;
    const isUserExist = await userModel.findOne({ email: requestBody?.email });
    if (isUserExist !== null) {
      res.status(409).json({ message: "User is Already Exist" });
    } else {
      const hashPass = genhashPass(requestBody?.password);
      requestBody = { ...requestBody, password: hashPass };
      const access_Token_user = genrateAccessToken(requestBody);
      const refresh_token_user = genrateRefreshToken(requestBody);

      const saveUserDatabase = await userModel.create(requestBody);
      let tokenStorageData = {};
      tokenStorageData = {
        ...tokenStorageData,
        userId: saveUserDatabase._id,
        access_token: access_Token_user,
        refresh_token: refresh_token_user,
      };
      if (tokenStorageData.userId !== "") {
        const tokenModalDatbase = await tokenModal.create(tokenStorageData);
        if (saveUserDatabase && tokenModalDatbase) {
          res
            .cookie("aceess_token", access_Token_user)
            .cookie("refresh_token", refresh_token_user)
            .status(200)
            .json({
              statusCode: 200,
              message: "Data submitted successfully",
              data: saveUserDatabase,
            });
        }
      }
    }
  } catch (err) {
    res.json({ message: err.message });
  }
};

// Login the Users
const userLogin = async (req, res) => {
  try {
    const { email } = req.body;
    const findUserbyEmail = await userModel.findOne({ email: email });

    if (findUserbyEmail === null) {
      res.status(404).json({ message: "User Does not exist" });
    } else {
      req.body.password = findUserbyEmail?.password;
      const newRefreshToken = genrateRefreshToken(req.body);
      const newAccessToken = genrateAccessToken(req.body);
      await tokenModal.updateOne(
        { userId: findUserbyEmail?._id },
        {
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
        }
      );
      res
        .cookie("access_token", newAccessToken)
        .cookie("refresh_token", newRefreshToken)
        .status(200)
        .json({
          statusCode: 200,
          message: "User is Authorized",
          data: findUserbyEmail,
        });
    }
  } catch (err) {
    res.json({ message: err.message });
  }
};
const getUserData = async (req, res) => {
  try {
    const userId = req.params.id;
    const getUserData = await userModel.findOne({ _id: userId });
    if (
      !getUserData?.username ||
      getUserData?.username === undefined ||
      getUserData?.username === null
    ) {
      res.status(404).json({ message: "User Does not Exist" });
    } else {
      res.status(200).json({
        statusCode: 200,
        message: "Data Found Successfully",
        data: getUserData,
      });
    }
  } catch (err) {
    res.json({ message: err.message });
  }
};
const refreshToken = async (req, res) => {
  try {
    const refresh_Token = await req?.headers.auth;
    if (refresh_Token) {
      console.log("Refresh token is ", refresh_Token);
      const isVerified = jwt.verify(
        refresh_Token,
        process.env.JWT_SECRET_KEY_REFRESH
      );
      console.log("IS Verified Data is ", isVerified);
      if (isVerified && isVerified !== undefined && isVerified !== null) {
        const newAccessToken = genrateAccessToken({ email: isVerified?.email });
        console.log("New Access Token is", newAccessToken);
        await tokenModal.updateOne(
          { refresh_token: refresh_Token },
          { access_token: newAccessToken }
        );
        return res
          .cookie("access_Token", newAccessToken)
          .json({ message: "Token Changed successfully" });
      }
    }
  } catch (err) {
    res.json({ message: err.message });
  }
};

const logoutAdmin = async (req, res) => {
  try {
    // const access_token = req?.headers?.access_token;
    // const refresh_token = req?.headers?.refresh_token;
    res
      .clearCookie("access_token")
      .clearCookie("refresh_token")
      .json({ message: "Cookies Deleted" });
  } catch (error) {
    res.json({ message: error.message });
  }
};

module.exports = {
  addUserData,
  getUserData,
  refreshToken,
  userLogin,
  logoutAdmin,
};
