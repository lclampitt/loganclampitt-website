import React from "react";
import { Link } from "react-router-dom";

export default function OtherExperience() {
  return (
    <>
      {/* Page-specific CSS */}
      <link rel="stylesheet" href="/css/other-experience.css" />

      <main className="page">
        {/* Back */}
        <Link className="back-link" to="/">
          Back to Home
        </Link>

        {/* Hero */}
        <section className="hero">
          <h1>Other Racing Experience</h1>
          <p>
            Beyond headline series, I’ve spent years competing in leagues, special
            events, and even got to experience real-world track days. These
            highlights feature the great accomplishments that I've gotten to do
            outside of sim racing.
          </p>

          {/* Chips (no icons = no pop) */}
          <div className="chips">
            <span className="chip">Leagues &amp; Special Events</span>
            <span className="chip">Racecraft &amp; Awareness</span>
            <span className="chip">Real-World Track Days</span>
          </div>
        </section>

        {/* Videos */}
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

        {/* Image */}
        <section className="section">
          <div className="media">
            <img src="/images/LOU_2776.2.jpg" alt="Other Racing Experience" />
          </div>
        </section>
      </main>
    </>
  );
}
