import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { generateInterViewReportController } from "../controllers/interviewController.js";
import { upload } from "../middleware/fileMiddleware.js";
const interviewRouter = Router();

/**
 * @route POST /api/interview
 * @access private
 * @description generate new interview report on the basis of user self desc, jod desc and resume
 */

interviewRouter.post(
  "/",
  authMiddleware,
  upload.single("resume"),
  generateInterViewReportController,
);

export default interviewRouter;
