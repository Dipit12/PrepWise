import mongoose from "mongoose";
import { PDFParse } from "pdf-parse";
import InterviewReport from "../models/interviewReportModel.js";
import {
  generateInterviewReport,
  generateResumePDF,
} from "../services/aiService.js";

export async function generateInterViewReportController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "Resume PDF file is required" });
    }

    const { selfDescription, jobDescription, title } = req.body;

    if (!jobDescription?.trim() || !selfDescription?.trim()) {
      return res.status(400).json({
        msg: "jobDescription and selfDescription are required",
      });
    }

    const parser = new PDFParse(Uint8Array.from(req.file.buffer));
    const resumeContent = await parser.getText();

    const derivedTitle =
      title?.trim() ||
      jobDescription
        ?.split("\n")
        .find((line) => line.trim().length > 0)
        ?.trim()
        ?.slice(0, 80) ||
      "Interview Report";

    const interViewReportByAI = await generateInterviewReport({
      jobDescription: jobDescription.trim(),
      candidateResume: resumeContent.text,
      selfDescription: selfDescription.trim(),
    });

    const createdReport = await InterviewReport.create({
      user: req.user.id,
      title: derivedTitle,
      resume: resumeContent.text,
      selfDescription: selfDescription.trim(),
      jobDescription: jobDescription.trim(),
      ...interViewReportByAI,
    });

    return res.status(201).json({
      msg: "Interview report generated successfully",
      interviewReportID: createdReport._id,
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
    if (!mongoose.Types.ObjectId.isValid(interviewID)) {
      return res.status(400).json({ msg: "Invalid interview report ID" });
    }

    const interviewReport = await InterviewReport.findOne({
      _id: interviewID,
      user: req.user.id,
    });

    if (!interviewReport) {
      return res.status(404).json({
        msg: "Interview Report not found",
      });
    }

    return res.status(200).json({
      msg: "Interview report fetched successfully",
      interviewReport,
    });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
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

/**
 * @description Generate updated resume PDF from an existing interview report
 * @route POST /api/interview/resume/pdf/:interviewReportID
 * @access Private
 */
export async function generateResumePdfController(req, res) {
  const { interviewReportID } = req.params;

  try {
    console.log("Starting PDF generation for report:", interviewReportID);
    
    if (!mongoose.Types.ObjectId.isValid(interviewReportID)) {
      return res.status(400).json({ msg: "Invalid interview report ID" });
    }

    // Ownership check: user can only generate PDF for their own report
    const interviewReport = await InterviewReport.findOne({
      _id: interviewReportID,
      user: req.user.id,
    });

    if (!interviewReport) {
      console.log("Interview report not found for ID:", interviewReportID);
      return res.status(404).json({
        msg: "Interview report not found",
      });
    }

    const { resume, jobDescription, selfDescription, title } = interviewReport;

    console.log("Generating PDF with resume length:", resume?.length || 0);
    
    const pdfBuffer = await generateResumePDF({
      resume,
      jobDescription,
      selfDescription,
      title,
    });

    console.log("PDF generated successfully, size:", pdfBuffer.length);

    const safeFileTitle =
      (title || "updated_resume")
        .replace(/[^a-z0-9_\- ]/gi, "")
        .trim()
        .replace(/\s+/g, "_")
        .slice(0, 50) || "updated_resume";

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeFileTitle}_${interviewReportID}.pdf"`,
      "Content-Length": pdfBuffer.length,
      "Cache-Control": "no-store",
    });

    return res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error("Generate resume PDF error:", err);
    console.error("Error stack:", err.stack);
    return res.status(500).json({
      msg: "Failed to generate resume PDF",
      error: err.message,
    });
  }
}
