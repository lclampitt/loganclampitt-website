import React from "react";
import { Link } from "react-router-dom";

export default function EnascCollege() {
  return (
    <>
      {/* Page-specific CSS */}
      <link rel="stylesheet" href="/css/enasc-college.css" />

      <main className="page">
        {/* Back */}
        <Link className="back-link" to="/">
          Back to Home
        </Link>

        {/* Hero */}
        <section className="hero">
          <h1>ENASCAR College iRacing Series</h1>
          <p>
            In the ENASCAR College iRacing Series, I represented California State
            University Fullerton against top collegiate drivers across the country.
            I would wind up winning two championships and earning over $25,000 in
            scholarship winnings.
          </p>

          {/* Chips (no icons = no pop) */}
          <div className="chips">
            <span className="chip">CSUF Esports</span>
            <span className="chip">National Broadcasts</span>
            <span className="chip">High-Pressure Racing</span>
          </div>
        </section>

        {/* Videos */}
        <section className="section">
          <h2>Featured Broadcast Clips</h2>

          <div className="video-grid">
            <article className="video-card">
              <iframe
                src="https://www.youtube.com/embed/QZLY9Q3jsjE?start=4630"
                title="ENASCAR College iRacing Highlight 1"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
              <div className="video-meta">
                <h3>ENASCAR College Series Championship</h3>
                <p>
                  Features the last three laps of the ENASCAR College iRacing
                  Series Championship.
                </p>
              </div>
            </article>

            <article className="video-card">
              <iframe
                src="https://www.youtube.com/embed/AzTAJeDYieA?start=5335"
                title="ENASCAR College iRacing Highlight 2"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
              <div className="video-meta">
                <h3>Kansas Speedway Win</h3>
                <p>
                  Features a regular season win at Kansas Speedway in the ENASCAR
                  College iRacing Series.
                </p>
              </div>
            </article>
          </div>
        </section>

        {/* Image */}
        <section className="section">
          <div className="media">
            <img
              src="/images/ENASCARCHAMPIONSHIP2025.png"
              alt="ENASCAR College iRacing Series"
            />
          </div>
        </section>
      </main>
    </>
  );
}
