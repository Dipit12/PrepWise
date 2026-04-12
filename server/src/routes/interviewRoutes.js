import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  generateInterViewReportController,
  getInterviewReportByID,
  getAllInterviewReport,
  generateResumePdfController,
} from "../controllers/interviewController.js";
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

/**
 * @route GET /api/interview/report/:interviewID
 * @description get interview report by interview ID
 * @access private
 */

interviewRouter.get(
  "/report/:interviewID",
  authMiddleware,
  getInterviewReportByID,
);

/**
 * @route GET /api/interview/
 * @description get all interview reports of logged in user
 * @access private
 */

interviewRouter.get("/", authMiddleware, getAllInterviewReport);

interviewRouter.post(
  "/resume/pdf/:interviewReportID",
  authMiddleware,
  generateResumePdfController,
);
export default interviewRouter;
