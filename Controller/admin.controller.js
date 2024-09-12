require("dotenv").config();
const argon2 = require("argon2");
const adminModal = require("../Models/adminModal");
const { genrateAccessToken } = require("../Utils/genrateToken");
const tokenmodal = require("../Models/tokenmodal");
const registerAdmin = async (req, res) => {
  try {
    let requestBody = req?.body;
    const adminExist = await adminModal.findOne({ email: requestBody?.email });
    if (adminExist !== null) {
      res.status(409).json({ message: "Admin is Already Exist" });
    } else {
      const hashPass = await argon2.hash(requestBody?.password);
      requestBody.password = hashPass;
      const access_token = genrateAccessToken(requestBody);
      requestBody = { ...requestBody, token: access_token };
      const addDataResult = await adminModal.create(requestBody);
      if (addDataResult !== null) {
        res.status(201).json({
          message: "Admin registered successfully",
          data: addDataResult,
        });
      }
    }
  } catch (error) {
    res.json({ message: error.message });
  }
};
const loginAdmin = async (req, res) => {
  try {
    const loginRequestBody = req?.body;
    const findAdmin = await adminModal.findOne({
      email: loginRequestBody?.email,
    });
    console.log("Admin Dataa is ", findAdmin);
    if (findAdmin !== null) {
      const checkPassword = await argon2.verify(
        findAdmin.password,
        loginRequestBody?.password
      );
      if (checkPassword) {
        const access_token = genrateAccessToken(loginRequestBody);
        await adminModal.updateOne(
          { email: loginRequestBody?.email },
          { token: access_token }
        );
        return res.status(200).json({
          message: "Admin found successfully",
        });
      } else {
        res.status(401).json({ message: "Please fill correct Credential" });
      }
    } else {
      res.status(404).json({ message: "Admin not Found" });
    }
  } catch (error) {
    res.json({ message: error.message });
  }
};

const changeAdminPassword = async (req, res) => {
  try {
    const id = req?.params?.id;
    const requestBody = req?.body;
    const findUserByID = await adminModal.findById(id);
    const verifyoldPass = await argon2.verify(
      findUserByID?.password,
      requestBody?.current_password
    );
    if (!verifyoldPass) {
      res.json({ message: "Please Fill correct current Password" });
    } else {
      const newPassword = await argon2.hash(requestBody?.new_password);
      await adminModal.updateOne({ _id: id }, { password: newPassword });
      res.status(200).json({ message: "Password Changed Successfully" });
    }
  } catch (error) {
    res.json({ message: error.message });
  }
};

const forgotPassAdmin = async (req, res) => {
  try {
    const requestBody = req.body;
    const findAdminByEmail = await adminModal.findOne({
      email: requestBody.email,
    });
    if (findAdminByEmail === null) {
      return res.json({ message: "Admin not Found" });
    } else {
      const newPassword = requestBody?.new_password;
      const hashnewPassword = await argon2.hash(newPassword);
      await adminModal.updateOne(
        { email: requestBody?.email },
        {
          password: hashnewPassword,
        }
      );
      return res.status(200).json({ message: "Password Updated Successfuly" });
    }
  } catch (error) {
    res.json({ message: error.message });
  }
};

const logoutAdmin = async (req, res) => {
  try {
    const id = req?.params?.id;
    console.log("env data is ", process.env.CUSTOM_TOKEN_AT_LOGOUT);
    await adminModal.updateOne(
      { _id: id },
      { token: process.env.CUSTOM_TOKEN_AT_LOGOUT }
    );
    return res.json({ statusCode: 200, message: "Logout Successfully" });
  } catch (err) {
    return res.json({ message: err.message });
  }
};
module.exports = {
  registerAdmin,
  loginAdmin,
  changeAdminPassword,
  forgotPassAdmin,
  logoutAdmin,
};
