import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/authController.js";
const authRouter = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */

authRouter.post("/register", registerUser);

/**
 * @route POST /api/auth/login
 * @desc Login a new user
 * @access Public
 */

authRouter.post("/login", loginUser);

/**
 * @route POST /api/auth/logout
 * @desc Logout a user
 * @access Public
 */

authRouter.post("/logout", logoutUser);

export default authRouter;
