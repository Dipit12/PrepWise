import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Blacklist from "../models/blacklistModel.js";

dotenv.config();

async function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ msg: "Token not provided" });
  }

  try {
    const isTokenBlackListed = await Blacklist.findOne({ token });
    if (isTokenBlackListed) {
      return res.status(401).json({ msg: "Token is blacklisted" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }
}
export default authMiddleware;
