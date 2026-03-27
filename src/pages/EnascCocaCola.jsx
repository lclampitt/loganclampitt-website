import React from "react";
import { Link } from "react-router-dom";

export default function EnascCocaCola() {
  return (
    <>
      {/* Page-specific CSS */}
      <link rel="stylesheet" href="/css/enasc-coca-cola.css" />

      <main className="page">
        {/* Back */}
        <Link className="back-link" to="/">
          Back to Home
        </Link>

        {/* Hero */}
        <section className="hero">
          <h1>ENASCAR Coca-Cola iRacing Series</h1>
          <p>
            The ENASCAR Coca-Cola iRacing Series represents the highest level of
            NASCAR-sanctioned sim racing. I competed in the series since I was
            15 years old for 8 years.
          </p>

          {/* Chips (no icons = no pop) */}
          <div className="chips">
            <span className="chip">Top-Level Competition</span>
            <span className="chip">National Broadcasts</span>
            <span className="chip">Pace &amp; Strategy</span>
          </div>
        </section>

        {/* Videos */}
        <section className="section">
          <h2>Featured Broadcast Clips</h2>

          <div className="video-grid">
            <article className="video-card">
              <iframe
                src="https://www.youtube.com/embed/8W9mW6Bb33Q?start=7649"
                title="Coca-Cola iRacing Series Highlight 1"
                allowFullScreen
              />

              <div className="video-meta">
                <h3>2021 Atlanta Motor Speedway Win</h3>
                <p>
                  Features the last lap of my victory at Atlanta Motor Speedway
                  in the 2021 ENASCAR Coca-Cola iRacing Series. This will end up
                  being my biggest career win to date eventually transferring me
                  into the Championship 4 to compete for $100,000.
                </p>
              </div>
            </article>

            <article className="video-card">
              <iframe
                src="https://www.youtube.com/embed/e0XrzIcBf8o?start=2134"
                title="Coca-Cola iRacing Series Highlight 2"
                allowFullScreen
              />

              <div className="video-meta">
                <h3>Championship 4 Pre-Race Segment</h3>
                <p>
                  Feature segment showcasing my point of view heading into the
                  race. Would wind up getting second place in the Championship.
                </p>
              </div>
            </article>
          </div>
        </section>

        {/* Image */}
        <section className="section">
          <div className="media">
            <img
              src="/images/Coke_LasVegas_42eRacr_LoganClampitt1_022525.png"
              alt="ENASCAR Coca-Cola iRacing Series"
            />
          </div>
        </section>
      </main>
    </>
  );
}
