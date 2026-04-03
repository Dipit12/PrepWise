import User from "../models/userModel.js";
import Blacklist from "../models/blacklistModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

/**
 * @name registerUser
 * @desc registers a new user, expects a username,email and password
 * @access Public
 */
export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) {
      return res.status(400).json({
        msg: "Please provide a username, email, and password",
      });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        msg: "User already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    const token = jwt.sign(
      {
        id: newUser._id,
        username: newUser.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.cookie("token", token);
    res.status(201).json({
      msg: "User registered successfully",
    });
  } catch (err) {
    res.status(500).json({
      msg: "Server error: " + err,
    });
  }
};

/**
 * @name loginUser
 * @desc logs in a user, expects an email and password
 * @access Public
 */

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({
        msg: "Please provide an email and password",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        msg: "User not found",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(403).json({
        msg: "Invalid credentials",
      });
    }
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );
    res.cookie("token", token);
    res.status(200).json({
      msg: "User logged in successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Server error: " + err,
    });
  }
};

export const logoutUser = async (req, res) => {
  const token = req.cookies.token;
  try {
    if (!token) {
      return res.status(400).json({
        msg: "No token provided",
      });
    }
    await Blacklist.create({ token });
    res.clearCookie("token");
    res.status(200).json({
      msg: "User logged out successfully",
    });
  } catch (err) {
    res.status(500).json({
      msg: "Server error: " + err,
    });
  }
};
