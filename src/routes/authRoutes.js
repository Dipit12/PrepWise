import { Router } from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
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

export default authRouter;
