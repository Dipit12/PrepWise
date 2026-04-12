import { useCallback, useContext } from "react";
import { InterviewContext } from "../interviewContext";
import {
  generateInterviewReport,
  getInterviewReportByID,
  getAllInterviewReport,
} from "../services/interviewApi";

export const useInterview = () => {
  const context = useContext(InterviewContext);

  if (!context) {
    throw new Error("useInterview must be used within an InterviewProvider");
  }

  const { loading, setLoading, report, setReport, reports, setReports } =
    context;

  const generateReport = useCallback(
    async ({ title, jobDescription, selfDescription, resume }) => {
      if (!jobDescription?.trim()) {
        throw new Error("jobDescription is required");
      }
      if (!selfDescription?.trim()) {
        throw new Error("selfDescription is required");
      }
      if (!resume) {
        throw new Error("resume file is required");
      }

      setLoading(true);
      try {
        const response = await generateInterviewReport({
          title: title?.trim(),
          jobDescription: jobDescription.trim(),
          selfDescription: selfDescription.trim(),
          resume,
        });

        const generatedReport =
          response?.interViewReportByAI ??
          response?.interviewReport ??
          response?.report ??
          null;

        setReport(generatedReport);
        return response;
      } catch (err) {
        console.error("Failed to generate interview report:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setReport],
  );

  const generateReportByID = useCallback(
    async (interviewID) => {
      if (!interviewID) {
        throw new Error("interviewID is required");
      }

      setLoading(true);
      try {
        const response = await getInterviewReportByID(interviewID);

        const fetchedReport =
          response?.interviewReport ?? response?.report ?? null;
        setReport(fetchedReport);

        return response;
      } catch (err) {
        console.error("Failed to fetch interview report by ID:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setReport],
  );

  const generateAllInterviewReports = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllInterviewReport();
      const allReports = response?.interviewReports ?? [];

      setReports(allReports);
      return response;
    } catch (err) {
      console.error("Failed to fetch all interview reports:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setReports]);

  const clearReport = useCallback(() => {
    setReport(null);
  }, [setReport]);

  return {
    loading,
    report,
    reports,
    setReport,
    setReports,
    clearReport,
    generateReport,
    generateReportByID,
    generateAllInterviewReports,
  };
};

export default useInterview;
