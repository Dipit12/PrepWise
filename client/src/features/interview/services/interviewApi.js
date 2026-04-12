import axios from "axios";

const API_BASE_URL = "https://prepwise-3.onrender.com";
// For local development, change to: "http://localhost:3001"

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const generateInterviewReport = async ({
  title,
  jobDescription,
  selfDescription,
  resume,
}) => {
  try {
    const formData = new FormData();

    if (title?.trim()) formData.append("title", title.trim());
    formData.append("jobDescription", jobDescription);
    formData.append("selfDescription", selfDescription);
    formData.append("resume", resume);

    const response = await api.post("/api/interview", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (err) {
    console.error("generateInterviewReport API error:", err);
    throw err;
  }
};

export const getInterviewReportByID = async (interviewID) => {
  try {
    const response = await api.get(`/api/interview/report/${interviewID}`);
    return response.data;
  } catch (err) {
    console.error("getInterviewReportByID API error:", err);
    throw err;
  }
};

export const getAllInterviewReport = async () => {
  try {
    const response = await api.get("/api/interview");
    return response.data;
  } catch (err) {
    console.error("getAllInterviewReport API error:", err);
    throw err;
  }
};

const extractFileNameFromDisposition = (contentDisposition) => {
  if (!contentDisposition) return "updated_resume.pdf";

  // handles: attachment; filename="abc.pdf" and filename*=UTF-8''abc.pdf
  const utf8Match = contentDisposition.match(
    /filename\*\s*=\s*UTF-8''([^;]+)/i,
  );
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1]);

  const basicMatch = contentDisposition.match(/filename\s*=\s*"?([^"]+)"?/i);
  if (basicMatch?.[1]) return basicMatch[1];

  return "updated_resume.pdf";
};

export const generateResumePDF = async ({ interviewReportID }) => {
  try {
    const response = await api.post(
      `/api/interview/resume/pdf/${interviewReportID}`,
      null,
      { responseType: "blob" },
    );

    return {
      blob: response.data,
      fileName: extractFileNameFromDisposition(
        response.headers?.["content-disposition"],
      ),
    };
  } catch (err) {
    console.error("generateResumePDF API error:", err);
    throw err;
  }
};

export const downloadResumePDF = async ({ interviewReportID }) => {
  const { blob, fileName } = await generateResumePDF({ interviewReportID });

  const blobUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(blobUrl);

  return { fileName };
};
