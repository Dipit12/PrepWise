import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
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
    if (title?.trim()) {
      formData.append("title", title.trim());
    }
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
