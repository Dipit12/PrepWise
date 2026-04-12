import { useMemo, useState } from "react";
import "../style/Interview.scss";

const report = {
  matchScore: 75,
  technicalQuestions: [
    {
      question:
        "Describe the difference between null and undefined in JavaScript.",
      intention:
        "Assess fundamental JavaScript knowledge and understanding of primitive types.",
      answer:
        "Undefined means a variable has been declared but not assigned a value. Null is an intentional assignment that represents no value.",
    },
    {
      question: "Explain the concept of the virtual DOM in React.",
      intention:
        "Evaluate understanding of React rendering and performance optimization.",
      answer:
        "React compares the old and new virtual DOM trees and updates only the changed parts in the real DOM.",
    },
    {
      question:
        "How would you handle authentication and authorization in a Node.js/Express app?",
      intention:
        "Test security best practices and auth architecture knowledge.",
      answer:
        "Use JWT/session tokens for authentication and role-based middleware for authorization on protected routes.",
    },
    {
      question:
        "What is the difference between SQL and NoSQL databases? When would you choose each?",
      intention: "Gauge understanding of database trade-offs and use cases.",
      answer:
        "SQL works best for relational, structured data and strict consistency; NoSQL is better for flexible schema and horizontal scale.",
    },
    {
      question: "Describe a scenario where you would use a RESTful API.",
      intention: "Assess API design understanding and practical usage.",
      answer:
        "REST is ideal for client-server communication where resources are accessed via standard HTTP methods.",
    },
  ],
  behavioralQuestions: [
    {
      question:
        "Tell me about a time you had to debug a complex issue. What was your process?",
      intention: "Understand structured problem-solving approach.",
      answer:
        "I isolated the issue, reproduced it, inspected state/inputs, tested hypotheses, then verified the fix with regression checks.",
    },
    {
      question:
        "Describe a project you are proud of. What was your role and challenge?",
      intention: "Assess ownership, impact, and communication.",
      answer:
        "I owned backend integration, optimized processing for large files, and balanced feature quality with cost constraints.",
    },
    {
      question:
        "How do you stay up-to-date with new technologies in full-stack development?",
      intention: "Evaluate learning mindset and consistency.",
      answer:
        "I follow official docs, newsletters, and implement mini projects to validate understanding.",
    },
    {
      question:
        "Tell me about a disagreement with a teammate. How did you handle it?",
      intention: "Assess collaboration and conflict resolution.",
      answer:
        "I aligned on outcomes, discussed trade-offs with data, and reached a practical compromise.",
    },
    {
      question: "How do you approach learning a new framework quickly?",
      intention: "Measure adaptability and learning strategy.",
      answer:
        "I start with fundamentals, build a small project, then iterate with deeper concepts and best practices.",
    },
  ],
  skillGaps: [
    {
      skill: "Advanced Cloud Architecture Patterns (AWS/GCP)",
      severity: "high",
    },
    {
      skill: "Deep Data Structures and Algorithms under time pressure",
      severity: "high",
    },
    { skill: "Performance Tuning and Observability", severity: "medium" },
    { skill: "Experience with PostgreSQL", severity: "low" },
    { skill: "CI/CD Pipeline Implementation", severity: "medium" },
  ],
  preparationPlan: [
    {
      day: 1,
      focus: "Core JavaScript & React Fundamentals",
      tasks: [
        "Review closures, prototypes, and async/await.",
        "Practice hooks: useState, useEffect, useContext.",
        "Revisit state management patterns.",
      ],
    },
    {
      day: 2,
      focus: "Node.js & Express API Development",
      tasks: [
        "Review event loop and modules.",
        "Build REST endpoints with Express.",
        "Implement middleware for errors and logging.",
      ],
    },
    {
      day: 3,
      focus: "Databases (MongoDB & PostgreSQL)",
      tasks: [
        "Review MongoDB schema/query patterns.",
        "Practice SQL queries and joins.",
        "Compare relational vs document modeling.",
      ],
    },
    {
      day: 4,
      focus: "Authentication, Authorization & Security",
      tasks: [
        "Deep dive into JWT implementation.",
        "Study XSS/CSRF protections.",
        "Review OAuth basics.",
      ],
    },
    {
      day: 5,
      focus: "Testing & CI/CD",
      tasks: [
        "Write unit tests with Jest.",
        "Practice React Testing Library flows.",
        "Create a simple GitHub Actions pipeline.",
      ],
    },
    {
      day: 6,
      focus: "System Design & Cloud Basics",
      tasks: [
        "Study scalability and availability trade-offs.",
        "Read AWS/GCP service fundamentals.",
        "Practice system design communication.",
      ],
    },
    {
      day: 7,
      focus: "Mock Interview & Review",
      tasks: [
        "Run a technical mock interview.",
        "Practice STAR for behavioral answers.",
        "Summarize key revision points.",
      ],
    },
  ],
};

const tabs = [
  { key: "technical", label: "Technical Questions" },
  { key: "behavioral", label: "Behavioral Questions" },
  { key: "roadmap", label: "Road Map" },
];

export default function Interview() {
  const [activeTab, setActiveTab] = useState("technical");

  const severityCount = useMemo(() => {
    return report.skillGaps.reduce(
      (acc, gap) => {
        acc[gap.severity] += 1;
        return acc;
      },
      { high: 0, medium: 0, low: 0 },
    );
  }, []);

  return (
    <main className="interview-page">
      <div className="interview-shell">
        <aside className="interview-nav panel">
          <div className="brand">
            <h2>Interview Report</h2>
            <p>Match Score</p>
            <span className="score-badge">{report.matchScore}%</span>
          </div>

          <nav className="tab-list" aria-label="Interview report sections">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="interview-main panel">
          {activeTab === "technical" && (
            <>
              <header className="section-header">
                <h3>Technical Questions</h3>
                <p>
                  Likely technical questions with intent and strong answer
                  direction.
                </p>
              </header>
              <div className="qa-list">
                {report.technicalQuestions.map((item, idx) => (
                  <article key={idx} className="qa-card">
                    <h4>{item.question}</h4>
                    <p>
                      <span>Intention:</span> {item.intention}
                    </p>
                    <p>
                      <span>How to answer:</span> {item.answer}
                    </p>
                  </article>
                ))}
              </div>
            </>
          )}

          {activeTab === "behavioral" && (
            <>
              <header className="section-header">
                <h3>Behavioral Questions</h3>
                <p>
                  Practice responses using STAR format for clarity and impact.
                </p>
              </header>
              <div className="qa-list">
                {report.behavioralQuestions.map((item, idx) => (
                  <article key={idx} className="qa-card">
                    <h4>{item.question}</h4>
                    <p>
                      <span>Intention:</span> {item.intention}
                    </p>
                    <p>
                      <span>How to answer:</span> {item.answer}
                    </p>
                  </article>
                ))}
              </div>
            </>
          )}

          {activeTab === "roadmap" && (
            <>
              <header className="section-header">
                <h3>7-Day Preparation Roadmap</h3>
                <p>
                  Daily focus areas and actionable tasks to improve interview
                  readiness.
                </p>
              </header>
              <div className="roadmap-grid">
                {report.preparationPlan.map((dayPlan) => (
                  <article key={dayPlan.day} className="day-card">
                    <div className="day-head">
                      <span className="day-pill">Day {dayPlan.day}</span>
                      <h4>{dayPlan.focus}</h4>
                    </div>
                    <ul>
                      {dayPlan.tasks.map((task, i) => (
                        <li key={i}>{task}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>

        <aside className="interview-skills panel">
          <header className="section-header compact">
            <h3>Skill Gaps</h3>
            <p>Priority areas to close before interviews.</p>
          </header>

          <div className="severity-row">
            <span className="severity-pill high">
              High: {severityCount.high}
            </span>
            <span className="severity-pill medium">
              Medium: {severityCount.medium}
            </span>
            <span className="severity-pill low">Low: {severityCount.low}</span>
          </div>

          <div className="skills-wrap">
            {report.skillGaps.map((gap, idx) => (
              <article key={idx} className={`skill-chip ${gap.severity}`}>
                <span>{gap.skill}</span>
                <small>{gap.severity}</small>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
