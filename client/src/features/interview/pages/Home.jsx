import React from "react";
import "../style/Home.scss";

export default function Home() {
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

        <section className="left panel">
          <div className="panel-title-wrap">
            <h2>Job Description</h2>
            <span className="pill">Required</span>
          </div>
          <textarea
            name="jobDescription"
            id="jobDescription"
            placeholder="Paste responsibilities, required skills, and experience level..."
          />
        </section>

        <section className="right panel">
          <div className="input-group">
            <label htmlFor="resume">Upload Resume (PDF)</label>
            <input type="file" name="resume" id="resume" accept=".pdf" />
          </div>

          <div className="input-group">
            <label htmlFor="selfDescription">Self Description</label>
            <textarea
              name="selfDescription"
              id="selfDescription"
              placeholder="Describe your strengths, experience, target role, and areas you want to improve..."
            />
          </div>

          <button className="generate-btn">
            <span>Generate Interview Report</span>
          </button>
        </section>
      </div>
    </main>
  );
}
