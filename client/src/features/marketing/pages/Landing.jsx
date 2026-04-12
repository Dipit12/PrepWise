import { Link } from "react-router-dom";

const features = [
  {
    title: "AI-Powered Interview Reports",
    desc: "Get tailored technical + behavioral questions, skill-gap analysis, and focused guidance in seconds.",
    icon: "✨",
  },
  {
    title: "Resume + JD Intelligence",
    desc: "Upload your resume and match it with the job description for role-specific preparation.",
    icon: "📄",
  },
  {
    title: "Actionable 7-Day Roadmap",
    desc: "Follow a practical plan with daily goals to improve confidence before interviews.",
    icon: "🗺️",
  },
];

const stats = [
  { label: "Interview Reports Generated", value: "10K+" },
  { label: "Average Prep Time Saved", value: "6 hrs" },
  { label: "Target Roles Covered", value: "50+" },
];

export default function Landing() {
  return (
    <main className="landing-page">
      <style>{`
        .landing-page {
          min-height: 100vh;
          color: #e9f0ff;
          font-family: Inter, "Segoe UI", Roboto, sans-serif;
          background:
            radial-gradient(900px 400px at 10% 0%, rgba(56, 189, 248, 0.25), transparent 60%),
            radial-gradient(900px 500px at 90% 100%, rgba(139, 92, 246, 0.22), transparent 60%),
            linear-gradient(130deg, #050915 0%, #0b1532 45%, #16144a 100%);
          padding: 1.25rem;
        }

        .landing-shell {
          width: min(1120px, 100%);
          margin: 0 auto;
        }

        .landing-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.2px;
        }

        .brand-dot {
          width: 12px;
          height: 12px;
          border-radius: 999px;
          background: linear-gradient(135deg, #38bdf8, #6366f1, #a855f7);
          box-shadow: 0 0 16px rgba(56, 189, 248, 0.75);
        }

        .nav-actions {
          display: flex;
          gap: 0.6rem;
        }

        .btn {
          text-decoration: none;
          border-radius: 0.75rem;
          padding: 0.58rem 0.95rem;
          font-weight: 600;
          font-size: 0.92rem;
          transition: all 0.2s ease;
        }

        .btn-ghost {
          color: #dbeafe;
          border: 1px solid rgba(148, 163, 184, 0.35);
          background: rgba(15, 23, 42, 0.45);
        }

        .btn-ghost:hover {
          border-color: rgba(96, 165, 250, 0.7);
          transform: translateY(-1px);
        }

        .btn-primary {
          color: #fff;
          border: 1px solid transparent;
          background: linear-gradient(96deg, #3b82f6, #6366f1, #8b5cf6);
          box-shadow: 0 10px 20px rgba(79, 70, 229, 0.35);
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          filter: brightness(1.06);
        }

        .hero {
          margin-top: 2rem;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 1rem;
          align-items: stretch;
        }

        .hero-copy,
        .hero-card,
        .feature-card,
        .step-card,
        .cta,
        .stats {
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 1rem;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(6px);
          box-shadow: 0 18px 40px rgba(2, 6, 23, 0.4);
        }

        .hero-copy {
          padding: 1.2rem;
        }

        .eyebrow {
          display: inline-flex;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.35px;
          color: #bfdbfe;
          border: 1px solid rgba(96, 165, 250, 0.35);
          background: rgba(59, 130, 246, 0.18);
          border-radius: 999px;
          padding: 0.25rem 0.5rem;
        }

        .hero h1 {
          margin: 0.85rem 0 0.7rem;
          line-height: 1.15;
          font-size: clamp(1.8rem, 4vw, 2.7rem);
        }

        .hero p {
          margin: 0;
          color: #b9c9e9;
          line-height: 1.6;
        }

        .hero-cta {
          margin-top: 1rem;
          display: flex;
          gap: 0.7rem;
          flex-wrap: wrap;
        }

        .hero-card {
          padding: 1.1rem;
          display: grid;
          gap: 0.75rem;
          align-content: start;
        }

        .hero-card h3 {
          margin: 0;
          font-size: 1.03rem;
          color: #dbeafe;
        }

        .hero-card ul {
          margin: 0;
          padding-left: 1rem;
          color: #c7d5ee;
          line-height: 1.55;
          font-size: 0.92rem;
        }

        .stats {
          margin-top: 1rem;
          padding: 0.9rem;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.65rem;
        }

        .stat {
          border-radius: 0.75rem;
          padding: 0.8rem;
          border: 1px solid rgba(148, 163, 184, 0.18);
          background: rgba(30, 41, 59, 0.55);
        }

        .stat h4 {
          margin: 0;
          font-size: 1rem;
          color: #e0e7ff;
        }

        .stat p {
          margin: 0.35rem 0 0;
          color: #9fb0d0;
          font-size: 0.82rem;
        }

        .section-title {
          margin: 2rem 0 0.9rem;
          font-size: 1.25rem;
          letter-spacing: 0.2px;
        }

        .features-grid,
        .steps-grid {
          display: grid;
          gap: 0.8rem;
        }

        .features-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .feature-card {
          padding: 1rem;
        }

        .feature-card h3 {
          margin: 0.6rem 0 0.45rem;
          font-size: 1rem;
          color: #e5edff;
        }

        .feature-card p {
          margin: 0;
          color: #b4c5e5;
          font-size: 0.92rem;
          line-height: 1.55;
        }

        .feature-icon {
          font-size: 1.2rem;
        }

        .steps-grid {
          margin-top: 0.6rem;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .step-card {
          padding: 0.95rem;
        }

        .step-number {
          font-size: 0.78rem;
          color: #93c5fd;
          font-weight: 700;
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }

        .step-card h4 {
          margin: 0.5rem 0 0.4rem;
          color: #e9efff;
        }

        .step-card p {
          margin: 0;
          color: #b4c5e5;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .cta {
          margin-top: 2rem;
          padding: 1.1rem;
          text-align: center;
          background:
            radial-gradient(500px 180px at 50% 0%, rgba(59, 130, 246, 0.2), transparent 70%),
            rgba(15, 23, 42, 0.6);
        }

        .cta h3 {
          margin: 0;
          font-size: 1.15rem;
        }

        .cta p {
          margin: 0.5rem 0 0.9rem;
          color: #b8c9e8;
        }

        .footer-note {
          margin-top: 1.4rem;
          text-align: center;
          color: #8ea1c5;
          font-size: 0.86rem;
        }

        @media (max-width: 940px) {
          .hero {
            grid-template-columns: 1fr;
          }

          .features-grid,
          .steps-grid {
            grid-template-columns: 1fr;
          }

          .stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="landing-shell">
        <section className="hero">
          <article className="hero-copy">
            <span className="eyebrow">AI Interview Prep Platform</span>
            <h1>
              Turn any job description into a personalized interview strategy.
            </h1>
            <p>
              PrepWise analyzes your resume, role requirements, and
              self-introduction to generate focused interview questions,
              skill-gap insights, and a day-by-day preparation plan.
            </p>
            <div className="hero-cta">
              <Link className="btn btn-primary" to="/register">
                Start Free
              </Link>
              <Link className="btn btn-ghost" to="/login">
                Continue to Dashboard
              </Link>
            </div>
          </article>

          <aside className="hero-card">
            <h3>What you get instantly</h3>
            <ul>
              <li>
                Role-specific technical and behavioral interview questions
              </li>
              <li>Skill-gap tagging by severity (high / medium / low)</li>
              <li>Structured 7-day preparation roadmap</li>
              <li>Saved report history for every interaction</li>
            </ul>
          </aside>
        </section>

        <section className="stats">
          {stats.map((item) => (
            <article className="stat" key={item.label}>
              <h4>{item.value}</h4>
              <p>{item.label}</p>
            </article>
          ))}
        </section>

        <h2 className="section-title">Core Features</h2>
        <section className="features-grid">
          {features.map((item) => (
            <article className="feature-card" key={item.title}>
              <span className="feature-icon">{item.icon}</span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </section>

        <h2 className="section-title">How it works</h2>
        <section className="steps-grid">
          <article className="step-card">
            <span className="step-number">Step 1</span>
            <h4>Upload your details</h4>
            <p>
              Enter title, paste JD, add self description, and upload resume
              PDF.
            </p>
          </article>
          <article className="step-card">
            <span className="step-number">Step 2</span>
            <h4>Generate AI report</h4>
            <p>
              We produce a complete interview prep report aligned with your
              target role.
            </p>
          </article>
          <article className="step-card">
            <span className="step-number">Step 3</span>
            <h4>Track past reports</h4>
            <p>
              Revisit previous reports and continue improving with every
              attempt.
            </p>
          </article>
        </section>

        <section className="cta">
          <h3>Ready to interview with confidence?</h3>
          <p>Build your first AI report and start preparing smarter today.</p>
          <Link className="btn btn-primary" to="/register">
            Create your account
          </Link>
        </section>

        <p className="footer-note">Made with ❤️ by Dipit Madan</p>
      </div>
    </main>
  );
}
