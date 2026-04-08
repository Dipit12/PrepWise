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

    const { selfDescription, jobDescription } = req.body;

    const interViewReportByAI = await generateInterviewReport({
      jobDescription,
      candidateResume: resumeContent.text,
      selfDescription,
    });

    await InterviewReport.create({
      user: req.user.id,
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
