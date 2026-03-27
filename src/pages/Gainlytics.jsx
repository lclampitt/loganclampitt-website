import React from "react";
import { Link } from "react-router-dom";

export default function Gainlytics() {
  return (
    <>
      {/* Page-specific CSS */}
      <link rel="stylesheet" href="/css/gainlytics.css" />

      <main className="page">
        {/* Back */}
        <Link className="back-link" to="/">
          Back to Home
        </Link>

        {/* Hero */}
        <section className="hero">
          <h1>Gainlytics – AI Fitness Analytics</h1>
          <p>
            Gainlytics is a full-stack fitness analytics platform I built to
            track body metrics, training, and nutrition using clean dashboards
            and AI-driven insights. It’s designed to be simple, fast, and useful
            for everyday lifters. This was my senior capstone project that I
            worked solo on.
          </p>

          {/* Chips (no icons = no pop) */}
          <div className="chips">
            <span className="chip">Dashboards &amp; Tracking</span>
            <span className="chip">Workouts &amp; PRs</span>
            <span className="chip">AI Insights</span>
          </div>

          {/* Features */}
          <div className="features">
            <h2>What it does</h2>
            <ul>
              <li>Log workouts, sets, and PRs with a streamlined UI.</li>
              <li>Track bodyweight and body fat over time using charts.</li>
              <li>Use AI to analyze trends and suggest goals/targets.</li>
              <li>Clean dark theme optimized for desktop + mobile.</li>
            </ul>
          </div>

          {/* Actions */}
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

        {/* Media */}
        <section className="section">
          <div className="media">
            <img src="/images/gainlytics.png" alt="Gainlytics Screenshot" />
          </div>
        </section>
      </main>
    </>
  );
}
