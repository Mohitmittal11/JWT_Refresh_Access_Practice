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
    const access_Token = await req?.headers.auth;
    // console.log("Accesss token is ", access_Token.slice(13, access_Token.length));
    if (access_Token) {
      console.log("Refresh token is ", refreshToken);
      const isVerified = jwt.verify(access_Token, process.env.JWT_SECRET_KEY);
      if (isVerified && isVerified !== undefined && isVerified !== null) {
        const accessToken = jwt.sign(
          { _id: isVerified?._id },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: "1h",
          }
        );
        return res
          .cookie(access_Token, accessToken)
          .json({ message: "Token Changed successfully" });
      }
    }
  } catch (err) {
    res.json({ message: err.message });
  }
};

module.exports = {
  addUserData,
  getUserData,
  refreshToken,
  userLogin,
};
