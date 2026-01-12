import React from "react";
import "../styles/services.css";

export default function Services() {
  return (
    <div id="services">
      <div className="container">
        <h1 className="sub-title">My Services</h1>
        <div className="services-list">
          <div>
            <i className="fa-solid fa-code"></i>
            <h2>Web Design</h2>
            <p>
              Clean, responsive websites built using HTML, CSS, and JavaScript.
              I focus on performance, mobile-friendliness, and visual appeal
              using modern design principles.
            </p>
          </div>
          <div>
            <i className="fa-solid fa-crop-simple"></i>
            <h2>IU/UX Design</h2>
            <p>
              Designing intuitive, user-centered interfaces and wireframes using
              tools like Figma. Focused on usability, accessibility, and
              aesthetic alignment with brand identity.
            </p>
          </div>
          <div>
            <i className="fa-brands fa-app-store"></i>
            <h2>App Design</h2>
            <p>
              Creating engaging layouts and user flows for mobile or web apps. I
              specialize in design mockups, prototyping, and collaborative
              workflows between design and dev teams.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
