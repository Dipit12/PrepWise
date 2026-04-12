import { PDFParse } from "pdf-parse";
import { generateInterviewReport } from "../services/aiService.js";
import InterviewReport from "../models/interviewReportModel.js";

export async function generateInterViewReportController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "Resume PDF file is required" });
    }

    const parser = new PDFParse(Uint8Array.from(req.file.buffer));
    const resumeContent = await parser.getText();

    const { selfDescription, jobDescription, title } = req.body;

    const derivedTitle =
      title?.trim() ||
      jobDescription
        ?.split("\n")
        .find((line) => line.trim().length > 0)
        ?.trim()
        ?.slice(0, 80) ||
      "Interview Report";

    const interViewReportByAI = await generateInterviewReport({
      jobDescription,
      candidateResume: resumeContent.text,
      selfDescription,
    });

    await InterviewReport.create({
      user: req.user.id,
      title: derivedTitle,
      resume: resumeContent.text,
      selfDescription,
      jobDescription,
      ...interViewReportByAI,
    });

    return res.status(201).json({
      msg: "Interview report generated successfully",
      interViewReportByAI,
    });
  } catch (error) {
    console.error("Generate interview report error:", error);
    return res.status(500).json({
      msg: "Failed to generate interview report",
      error: error.message,
    });
  }
}

export async function getInterviewReportByID(req, res) {
  const { interviewID } = req.params;

  try {
    const interviewReport = await InterviewReport.findOne({
      _id: interviewID,
      user: req.user.id,
    });
    if (!interviewReport) {
      return res.status(404).json({
        msg: "Interview Report not found",
      });
    }
    res.status(200).json({
      msg: "Interview report fetched successfully",
      interviewReport,
    });
  } catch (err) {
    res.status(501).json({
      msg: err,
    });
  }
}

export async function getAllInterviewReport(req, res) {
  try {
    const interviewReports = await InterviewReport.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select(
        "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan",
      );

    if (interviewReports.length === 0) {
      return res.status(404).json({
        msg: "No interview reports found",
      });
    }

    return res.status(200).json({
      msg: "Found all the interview reports",
      interviewReports,
    });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
}
