import React from "react";

export default function EnascCollege() {
  return (
    <>
      {/* Keep your existing CSS file exactly as-is */}
      <link rel="stylesheet" href="/css/enasc-college.css" />

      <main className="page">
        {/* Back */}
        <a className="back-link" href="/">
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
        </a>

        {/* Hero */}
        <section className="hero">
          <h1>ENASCAR College iRacing Series</h1>
          <p>
            In the ENASCAR College iRacing Series, I represented California State
            University Fullerton against top collegiate drivers across the country.
            I would wind up winning two championships and earning over $25,000 in scholarship winnings.
          </p>

          <div className="badges">
            <span className="badge">
              <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 3 1.5 8.25 12 13.5l10.5-5.25L12 3Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M4.5 10.25V16c0 1.5 3.3 3.5 7.5 3.5s7.5-2 7.5-3.5v-5.75"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M22.5 8.25V14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              CSUF Esports
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
              National Broadcasts
            </span>

            <span className="badge">
              <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M9 2h6M12 8v4l2.5 2.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 21a8 8 0 1 0-8-8 8 8 0 0 0 8 8Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M16.5 5.5 18 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              High-Pressure Racing
            </span>
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
                  Features the last three laps of the ENASCAR College iRacing Series Championship.
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
                  Features a regular season win at Kansas Speedway in the ENASCAR College iRacing Series.
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
