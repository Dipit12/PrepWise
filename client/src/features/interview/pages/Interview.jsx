import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../style/Interview.scss";
import { useInterview } from "../hook/useInterview";

const tabs = [
  { key: "technical", label: "Technical Questions" },
  { key: "behavioral", label: "Behavioral Questions" },
  { key: "roadmap", label: "Road Map" },
];

export default function Interview() {
  const navigate = useNavigate();
  const { interviewID } = useParams();

  const {
    loading,
    report,
    reports,
    generateReportByID,
    generateAllInterviewReports,
  } = useInterview();

  const [activeTab, setActiveTab] = useState("technical");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      try {
        await generateAllInterviewReports();
      } catch (err) {
        // History is best-effort. Keep page usable even if this fails.
        console.error("Failed to load report history:", err);
      }
    };

    loadHistory();
  }, [generateAllInterviewReports]);

  useEffect(() => {
    const loadReport = async () => {
      if (!interviewID) {
        setError("");
        return;
      }

      try {
        setError("");
        await generateReportByID(interviewID);
      } catch (err) {
        const msg =
          err?.response?.data?.msg ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to load interview report.";
        setError(msg);
      }
    };

    loadReport();
  }, [interviewID, generateReportByID]);

  const technicalQuestions = useMemo(
    () => report?.technicalQuestions ?? [],
    [report],
  );
  const behavioralQuestions = useMemo(
    () => report?.behavioralQuestions ?? [],
    [report],
  );
  const preparationPlan = useMemo(
    () => report?.preparationPlan ?? [],
    [report],
  );
  const skillGaps = useMemo(() => report?.skillGaps ?? [], [report]);

  const severityCount = useMemo(() => {
    return skillGaps.reduce(
      (acc, gap) => {
        const level = String(gap?.severity || "").toLowerCase();
        if (level === "high") acc.high += 1;
        if (level === "medium") acc.medium += 1;
        if (level === "low") acc.low += 1;
        return acc;
      },
      { high: 0, medium: 0, low: 0 },
    );
  }, [skillGaps]);

  const openReportFromHistory = (id) => {
    if (!id) return;
    navigate(`/workspace/interview-report/${id}`);
  };

  const formatDate = (value) => {
    if (!value) return "Unknown date";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Unknown date";
    return date.toLocaleString();
  };

  if (loading && !report) {
    return (
      <main className="interview-page">
        <div className="interview-shell">
          <section className="interview-main panel">
            <div className="section-header">
              <h3>Loading interview report...</h3>
              <p>Please wait while we fetch your report.</p>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="interview-page">
        <div className="interview-shell">
          <section className="interview-main panel">
            <div className="section-header">
              <h3>Unable to load report</h3>
              <p>{error}</p>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="interview-page">
      <div className="interview-shell">
        <aside className="interview-nav panel">
          <div className="brand">
            <h2>{report?.title || "Interview Report"}</h2>
            <p>Match Score</p>
            <span className="score-badge">{report?.matchScore ?? 0}%</span>
          </div>

          <nav className="tab-list" aria-label="Interview report sections">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="history-list" style={{ marginTop: "1rem" }}>
            <p
              style={{
                margin: "0 0 0.55rem",
                fontSize: "0.82rem",
                color: "#9cadcc",
                fontWeight: 600,
              }}
            >
              Previous Reports
            </p>

            {reports.length === 0 ? (
              <p style={{ margin: 0, fontSize: "0.84rem", color: "#9cadcc" }}>
                No previous reports yet.
              </p>
            ) : (
              reports.map((item) => {
                const id = item?._id;
                const isActive = id && id === interviewID;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => openReportFromHistory(id)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      borderRadius: "0.7rem",
                      border: isActive
                        ? "1px solid rgba(6,182,212,0.55)"
                        : "1px solid rgba(148,163,184,0.25)",
                      background: isActive
                        ? "linear-gradient(90deg, rgba(6,182,212,0.2), rgba(59,130,246,0.2))"
                        : "rgba(15, 23, 42, 0.45)",
                      color: "#e8efff",
                      padding: "0.58rem 0.65rem",
                      marginBottom: "0.5rem",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.84rem",
                        fontWeight: 600,
                        lineHeight: 1.35,
                      }}
                    >
                      {item?.title || "Untitled Report"}
                    </div>
                    <div
                      style={{
                        marginTop: "0.2rem",
                        fontSize: "0.76rem",
                        color: "#9cadcc",
                      }}
                    >
                      {formatDate(item?.createdAt)}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="interview-main panel">
          {!report ? (
            <div className="section-header">
              <h3>No report selected</h3>
              <p>
                Generate a new report from workspace or select one from Previous
                Reports.
              </p>
            </div>
          ) : (
            <>
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
                    {technicalQuestions.length === 0 ? (
                      <p>No technical questions available.</p>
                    ) : (
                      technicalQuestions.map((item, idx) => (
                        <article key={idx} className="qa-card">
                          <h4>{item?.question}</h4>
                          <p>
                            <span>Intention:</span> {item?.intention}
                          </p>
                          <p>
                            <span>How to answer:</span> {item?.answer}
                          </p>
                        </article>
                      ))
                    )}
                  </div>
                </>
              )}

              {activeTab === "behavioral" && (
                <>
                  <header className="section-header">
                    <h3>Behavioral Questions</h3>
                    <p>
                      Practice responses using STAR format for clarity and
                      impact.
                    </p>
                  </header>
                  <div className="qa-list">
                    {behavioralQuestions.length === 0 ? (
                      <p>No behavioral questions available.</p>
                    ) : (
                      behavioralQuestions.map((item, idx) => (
                        <article key={idx} className="qa-card">
                          <h4>{item?.question}</h4>
                          <p>
                            <span>Intention:</span> {item?.intention}
                          </p>
                          <p>
                            <span>How to answer:</span> {item?.answer}
                          </p>
                        </article>
                      ))
                    )}
                  </div>
                </>
              )}

              {activeTab === "roadmap" && (
                <>
                  <header className="section-header">
                    <h3>7-Day Preparation Roadmap</h3>
                    <p>
                      Daily focus areas and actionable tasks to improve
                      interview readiness.
                    </p>
                  </header>
                  <div className="roadmap-grid">
                    {preparationPlan.length === 0 ? (
                      <p>No roadmap available.</p>
                    ) : (
                      preparationPlan.map((dayPlan) => (
                        <article key={dayPlan?.day} className="day-card">
                          <div className="day-head">
                            <span className="day-pill">Day {dayPlan?.day}</span>
                            <h4>{dayPlan?.focus}</h4>
                          </div>
                          <ul>
                            {(dayPlan?.tasks ?? []).map((task, i) => (
                              <li key={i}>{task}</li>
                            ))}
                          </ul>
                        </article>
                      ))
                    )}
                  </div>
                </>
              )}
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
            {skillGaps.length === 0 ? (
              <p>No skill gaps reported.</p>
            ) : (
              skillGaps.map((gap, idx) => {
                const severity = String(gap?.severity || "").toLowerCase();
                return (
                  <article key={idx} className={`skill-chip ${severity}`}>
                    <span>{gap?.skill}</span>
                    <small>{severity}</small>
                  </article>
                );
              })
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
