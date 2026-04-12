import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Home.scss";
import { useInterview } from "../hook/useInterview";

export default function Home() {
  const navigate = useNavigate();
  const { loading, generateReport } = useInterview();

  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const resumeInputRef = useRef(null);

  const validateForm = () => {
    const resumeFile = resumeInputRef.current?.files?.[0];

    if (!jobTitle.trim()) return "Please enter the job title.";
    if (!jobDescription.trim()) return "Please enter the job description.";
    if (!selfDescription.trim()) return "Please enter your self description.";
    if (!resumeFile) return "Please upload your resume (PDF).";

    const isPdf =
      resumeFile.type === "application/pdf" ||
      resumeFile.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) return "Only PDF resumes are supported.";

    return "";
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setFormError("");

    const validationMessage = validateForm();
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    const resume = resumeInputRef.current.files[0];

    try {
      setSubmitting(true);
      await generateReport({
        title: jobTitle.trim(),
        jobDescription: jobDescription.trim(),
        selfDescription: selfDescription.trim(),
        resume,
      });

      // Report is stored in context by useInterview.generateReport
      navigate("/workspace/interview-report");
    } catch (err) {
      const apiMsg = err?.response?.data?.msg || err?.response?.data?.error;
      setFormError(apiMsg || "Could not generate report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isBusy = loading || submitting;

  return (
    <main className="home">
      <div className="page-shell">
        <header className="home-header">
          <h1>AI Interview Report Generator</h1>
          <p>
            Paste role requirements, upload your resume, and generate a
            personalized prep plan.
          </p>
        </header>

        <form onSubmit={handleGenerateReport} className="left panel">
          <div className="panel-title-wrap">
            <h2>Job Description</h2>
            <span className="pill">Required</span>
          </div>

          <div className="input-group">
            <label htmlFor="jobTitle">Job Title</label>
            <input
              type="text"
              name="jobTitle"
              id="jobTitle"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Full Stack Developer"
              disabled={isBusy}
            />
          </div>

          <textarea
            name="jobDescription"
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste responsibilities, required skills, and experience level..."
            disabled={isBusy}
          />
        </form>

        <section className="right panel">
          <div className="input-group">
            <label htmlFor="resume">Upload Resume (PDF)</label>
            <input
              ref={resumeInputRef}
              type="file"
              name="resume"
              id="resume"
              accept=".pdf,application/pdf"
              disabled={isBusy}
            />
          </div>

          <div className="input-group">
            <label htmlFor="selfDescription">Self Description</label>
            <textarea
              name="selfDescription"
              id="selfDescription"
              value={selfDescription}
              onChange={(e) => setSelfDescription(e.target.value)}
              placeholder="Describe your strengths, experience, target role, and areas you want to improve..."
              disabled={isBusy}
            />
          </div>

          {formError ? (
            <p role="alert" style={{ color: "#fca5a5", margin: 0 }}>
              {formError}
            </p>
          ) : null}

          <button
            className="generate-btn"
            onClick={handleGenerateReport}
            disabled={isBusy}
          >
            <span>
              {isBusy ? "Generating Report..." : "Generate Interview Report"}
            </span>
          </button>
        </section>
      </div>
    </main>
  );
}
