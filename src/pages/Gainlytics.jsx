import React from "react";
import { Link } from "react-router-dom";

export default function Gainlytics() {
  return (
    <>
      <link rel="stylesheet" href="/css/gainlytics.css" />

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
          <h1>Gainlytics – AI Fitness Analytics</h1>
          <p>
            Gainlytics is a full-stack fitness analytics platform I built to track
            body metrics, training, and nutrition using clean dashboards and
            AI-driven insights. It’s designed to be simple, fast, and useful for
            everyday lifters. This was my senior capstone project that I worked
            solo on.
          </p>

          <div className="badges">
            <span className="badge">
              <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M4 4h16v16H4z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 10h16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M10 20V10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Dashboards &amp; Tracking
            </span>

            <span className="badge">
              <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M4 10v4M8 9v6M16 9v6M20 10v4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M8 12h8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Workouts &amp; PRs
            </span>

            <span className="badge">
              <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 2l1.2 4.2L17 7.4l-3.8 1.2L12 13l-1.2-4.4L7 7.4l3.8-1.2L12 2Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M19 11l.8 2.7L22 14.5l-2.2.8L19 18l-.8-2.7L16 14.5l2.2-.8L19 11Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
              AI Insights
            </span>
          </div>

          <div className="features">
            <h2>What it does</h2>
            <ul>
              <li>Log workouts, sets, and PRs with a streamlined UI.</li>
              <li>Track bodyweight and body fat over time using charts.</li>
              <li>Use AI to analyze trends and suggest goals/targets.</li>
              <li>Clean dark theme optimized for desktop + mobile.</li>
            </ul>
          </div>

          <div className="actions">
            <a
              className="btn primary"
              href="https://gainlytics.org"
              target="_blank"
              rel="noreferrer"
            >
              Visit Live Site
            </a>

            <a
              className="btn"
              href="https://github.com/lclampitt/gainlytics"
              target="_blank"
              rel="noreferrer"
            >
              View GitHub Repo
            </a>
          </div>
        </section>

        <section className="section">
          <div className="media">
            <img src="/images/gainlytics.png" alt="Gainlytics Screenshot" />
          </div>
          <p className="footer-note">
            Built with a modern web stack focused on usability and clean UI/UX.
          </p>
        </section>
      </main>
    </>
  );
}
