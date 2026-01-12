import React from "react";
import { Link } from "react-router-dom";

export default function Connect4AI() {
  return (
    <>
      <link rel="stylesheet" href="/css/connect4ai.css" />

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
          <h1>Connect 4 AI</h1>
          <p>
            A Connect 4 AI project exploring game decision-making and search-based
            strategies. The goal was to build an agent that can evaluate board
            states, anticipate threats, and play consistently under different
            scenarios.
          </p>

          <div className="badges">
            <span className="badge">
              <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M9 21c-2 0-4-2-4-4V9c0-2 2-4 4-4 1.2 0 2.3.6 3 1.5C12.7 5.6 13.8 5 15 5c2 0 4 2 4 4v8c0 2-2 4-4 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M9 21v-4M15 21v-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              AI / Decision-Making
            </span>

            <span className="badge">
              <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M4 4h16v16H4z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M4 10h16M4 16h16M10 4v16M16 4v16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Board Evaluation
            </span>

            <span className="badge">
              <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M8 4h8v3c0 3-2 5-4 5s-4-2-4-5V4Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 7H4c0 3 2 5 4 5M18 7h2c0 3-2 5-4 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M10 12v3a2 2 0 0 1-2 2H7v3h10v-3h-1a2 2 0 0 1-2-2v-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Strategy &amp; Performance
            </span>
          </div>

          <div className="features">
            <h2>Highlights</h2>
            <ul>
              <li>Implements an AI agent that selects moves based on board state.</li>
              <li>Evaluates threats, winning lines, and positional advantage.</li>
              <li>Designed to play consistently with a clear decision process.</li>
              <li>Built as a course project focused on AI concepts in games.</li>
            </ul>
          </div>

          <div className="actions">
            <a
              className="btn primary"
              href="https://drive.google.com/file/d/1OjClzCEPo4WdMD-YScglCydnQWiWCVHe/view"
              target="_blank"
              rel="noreferrer"
            >
              View Demo
            </a>

            <a
              className="btn"
              href="https://github.com/lclampitt/connect4-ai-pygame"
              target="_blank"
              rel="noreferrer"
            >
              View GitHub Repo
            </a>
          </div>
        </section>

        <section className="section">
          <div className="media">
            <img src="/images/connect4ai.png" alt="Connect 4 AI Screenshot" />
          </div>
        </section>
      </main>
    </>
  );
}
