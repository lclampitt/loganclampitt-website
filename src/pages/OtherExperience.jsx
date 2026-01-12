import React from "react";
import { Link } from "react-router-dom";

export default function OtherExperience() {
  return (
    <>
      <link rel="stylesheet" href="/css/other-experience.css" />

      <main className="page">
        <Link className="back-link" to="/">
          <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M10.5 19.5 3 12l7.5-7.5M3 12h18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to Home
        </Link>

        <section className="hero">
          <h1>Other Racing Experience</h1>
          <p>
            Beyond headline series, I’ve spent years competing in leagues, special
            events, and even got to experience real-world track days. These
            highlights feature the great accomplishments that I've gotten to do
            outside of sim racing.
          </p>

          <div className="badges">
            <span className="badge">
              <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
                <circle
                  cx="12"
                  cy="12"
                  r="8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M4.7 13.5h14.6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M9.2 12a2.8 2.8 0 1 0 5.6 0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Leagues &amp; Special Events
            </span>

            <span className="badge">
              <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M5 21V4m0 0c3-2 6 2 9 0s6 2 9 0v10c-3 2-6-2-9 0s-6-2-9 0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Racecraft &amp; Awareness
            </span>

            <span className="badge">
              <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M10 21 7 3m10 18 3-18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M12 7v2m0 4v2m0 4v1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Real-World Track Days
            </span>
          </div>
        </section>

        <section className="section">
          <h2>On-Board Highlights</h2>

          <div className="video-grid">
            <article className="video-card">
              <iframe
                src="https://www.youtube.com/embed/Mtd2OrcN2wU?start=738"
                title="Other Experience Highlight 1"
                allowFullScreen
              />
              <div className="video-meta">
                <h3>On-Board Hot Lap</h3>
                <p>
                  Features an on-board hot lap in a Mazda MX-5 Cup car at the
                  Thermal Club.
                </p>
              </div>
            </article>

            <article className="video-card">
              <iframe
                src="https://www.youtube.com/embed/JYCm3LJToeQ?start=3302"
                title="Other Experience Highlight 2"
                allowFullScreen
              />
              <div className="video-meta">
                <h3>Mazda Hot Lap Challenge Finish</h3>
                <p>Features the last lap of the Mazda Hot Lap Challenge.</p>
              </div>
            </article>
          </div>
        </section>

        <section className="section">
          <div className="media">
            <img src="/images/LOU_2776.2.jpg" alt="Other Racing Experience" />
          </div>
        </section>
      </main>
    </>
  );
}
