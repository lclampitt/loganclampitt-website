import React from "react";
import { Link } from "react-router-dom";

export default function Connect4AI() {
  return (
    <>
      {/* Page-specific CSS */}
      <link rel="stylesheet" href="/css/connect4ai.css" />

      <main className="page">
        {/* Back */}
        <Link className="back-link" to="/">
          Back to Home
        </Link>

        {/* Hero */}
        <section className="hero">
          <h1>Connect 4 AI</h1>
          <p>
            A Connect 4 AI project exploring game decision-making and search-based
            strategies. The goal was to build an agent that can evaluate board
            states, anticipate threats, and play consistently under different
            scenarios.
          </p>

          {/* Chips (no icons = no pop) */}
          <div className="chips">
            <span className="chip">AI / Decision-Making</span>
            <span className="chip">Board Evaluation</span>
            <span className="chip">Strategy &amp; Performance</span>
          </div>

          {/* Features */}
          <div className="features">
            <h2>Highlights</h2>
            <ul>
              <li>Implements an AI agent that selects moves based on board state.</li>
              <li>Evaluates threats, winning lines, and positional advantage.</li>
              <li>Designed to play consistently with a clear decision process.</li>
              <li>Built as a course project focused on AI concepts in games.</li>
            </ul>
          </div>

          {/* Actions */}
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

        {/* Image */}
        <section className="section">
          <div className="media">
            <img src="/images/connect4ai.png" alt="Connect 4 AI Screenshot" />
          </div>
        </section>
      </main>
    </>
  );
}
