import User from "../models/userModel.js";
import Blacklist from "../models/blacklistModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// Input validation helper
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateUsername = (username) => {
  return username && username.length >= 3 && username.length <= 50;
};

/**
 * @name registerUser
 * @desc registers a new user, expects a username,email and password
 * @access Public
 */
export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        msg: "Please provide a username, email, and password",
      });
    }

    if (!validateUsername(username)) {
      return res.status(400).json({
        msg: "Username must be 3-50 characters long",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        msg: "Please provide a valid email address",
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        msg: "Password must be at least 6 characters long",
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

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
      msg: "User registered successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({
      msg: "Server error during registration",
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

    if (!validateEmail(email)) {
      return res.status(400).json({
        msg: "Please provide a valid email address",
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
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      msg: "User logged in successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      msg: "Server error during login",
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
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    res.status(200).json({
      msg: "User logged out successfully",
    });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({
      msg: "Server error during logout",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        msg: "User not found",
      });
    }
    res.status(200).json({
      msg: "User retrieved successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("GetMe error:", err);
    return res.status(500).json({
      msg: "Server error retrieving user",
    });
  }
};
