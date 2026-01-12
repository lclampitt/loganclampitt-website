import React from "react";
import { Link } from "react-router-dom";
import "../styles/projects.css";

export default function Projects() {
  return (
    <div id="projects">
      <div className="container">
        <h1 className="sub-title">Projects</h1>

        <div className="racing-list">
          {/* ---------------- Gainlytics Project ---------------- */}
          <div className="racing is-logo-card">
            <img
              src="/images/gainlytics-logo.png"
              alt="Gainlytics Logo"
              className="gainlytics-thumb"
            />

            <div className="layer layer-cyan">
              <h3>Gainlytics (AI Fitness Platform)</h3>

              <div className="layer-actions">
                {/* External live site */}
                <a
                  href="https://gainlytics.org"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open Gainlytics live site"
                >
                  <i className="fa-solid fa-up-right-from-square"></i>
                </a>

                {/* External GitHub */}
                <a
                  href="https://github.com/lclampitt/gainlytics"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open Gainlytics GitHub repository"
                >
                  <i className="fa-brands fa-github"></i>
                </a>

                {/* Internal React route */}
                <Link
                  to="/gainlytics"
                  aria-label="Read more about Gainlytics"
                >
                  <i className="fa-solid fa-circle-info"></i>
                </Link>
              </div>
            </div>
          </div>
          {/* ---------------- End Gainlytics ---------------- */}

          {/* ---------------- Connect 4 AI ---------------- */}
          <div className="racing">
            <img src="/images/connect4ai.png" alt="Connect 4 AI" />

            <div className="layer layer-orange">
              <h3>Connect 4 AI</h3>

              <div className="layer-actions">
                {/* External demo */}
                <a
                  href="https://drive.google.com/file/d/1OjClzCEPo4WdMD-YScglCydnQWiWCVHe/view"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open Connect 4 AI demo"
                >
                  <i className="fa-solid fa-up-right-from-square"></i>
                </a>

                {/* External GitHub */}
                <a
                  href="https://github.com/lclampitt/connect4-ai-pygame"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open Connect 4 AI GitHub repository"
                >
                  <i className="fa-brands fa-github"></i>
                </a>

                {/* Internal React route */}
                <Link
                  to="/connect4ai"
                  aria-label="Read more about Connect 4 AI"
                >
                  <i className="fa-solid fa-circle-info"></i>
                </Link>
              </div>
            </div>
          </div>

          {/* ---------------- Portfolio Website ---------------- */}
          <div className="racing">
            <img src="/images/portfolio-website.png" alt="Portfolio Website" />

            <div className="layer layer-red">
              <h3>Portfolio Website</h3>

              <div className="layer-actions">
                <a
                  href="https://loganclampitt.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open portfolio website"
                >
                  <i className="fa-solid fa-up-right-from-square"></i>
                </a>
              </div>
            </div>
          </div>
          {/* ---------------- End Portfolio ---------------- */}
        </div>
      </div>
    </div>
  );
}
