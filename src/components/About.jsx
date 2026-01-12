import React, { useState } from "react";
import "../styles/about.css";

export default function About() {
  const [activeTab, setActiveTab] = useState("skills");

  return (
    <div id="about">
      <div className="container">
        <div className="row">
          <div className="about-col-1">
            <img
              src="/images/LC_013 (1) (1).jpg"
              alt="Logan Clampitt portrait"
            />
          </div>

          <div className="about-col-2">
            <h1 className="sub-title">About Me</h1>

            <p>
              Hi, my name is Logan Clampitt, a Computer Science graduate from California State
              University Fullerton. I’ve been passionate about computers and programming
              from a young age, and I enjoy building clean, functional software while
              continuously improving my skills as a developer.
              <br />
              <br />
              Outside of coding, I have a strong interest in graphic design,
              video editing, and sim racing, where I’ve competed professionally
              for over 8 years. Racing has taught me discipline and focus that I
              apply to both my career and academics.
            </p>

            {/* Tabs */}
            <div className="tab-titles">
              <p
                className={`tab-links ${
                  activeTab === "skills" ? "active-link" : ""
                }`}
                onClick={() => setActiveTab("skills")}
              >
                Skills
              </p>
              <p
                className={`tab-links ${
                  activeTab === "experience" ? "active-link" : ""
                }`}
                onClick={() => setActiveTab("experience")}
              >
                Applied Experience
              </p>
              <p
                className={`tab-links ${
                  activeTab === "education" ? "active-link" : ""
                }`}
                onClick={() => setActiveTab("education")}
              >
                Education
              </p>
            </div>

            {/* Skills */}
            <div
              className={`tab-contents ${
                activeTab === "skills" ? "active-tab" : ""
              }`}
              id="skills"
            >
              <ul>
                <li>
                  <span>JavaScript / React</span>
                  <br />
                  Modern front-end development with reusable components
                </li>
                <li>
                  <span>HTML / CSS</span>
                  <br />
                  Responsive layouts, animations, and UI polish
                </li>
                <li>
                  <span>Python / C++</span>
                  <br />
                  Algorithms, data structures, and problem solving
                </li>
                <li>
                  <span>UI / UX Design</span>
                  <br />
                  Clean interfaces with a focus on usability and clarity
                </li>
              </ul>
            </div>

            {/* Applied Experience */}
            <div
              className={`tab-contents ${
                activeTab === "experience" ? "active-tab" : ""
              }`}
              id="experience"
            >
              <ul>
                <li>
                  <span>2023 – Present</span>
                  <br />
                  <strong>Applied Software Development</strong>
                  <br />
                  Built and shipped multiple front-end and full-stack projects
                  using React, JavaScript, and modern web tooling. Focused on
                  clean UI, maintainable components, and real-world usability.
                </li>

                <li>
                  <span>2022 – 2025</span>
                  <br />
                  <strong>Academic & Personal Projects (CSUF)</strong>
                  <br />
                  Applied classroom concepts from computer science coursework
                  to hands-on projects involving algorithms, AI concepts, and
                  interactive applications.
                </li>

                <li>
                  <span>2015 – Present</span>
                  <br />
                  <strong>Professional Sim Racing (iRacing)</strong>
                  <br />
                  Competed nationally for over 8 years, developing strong
                  decision-making, adaptability, and performance under
                  pressure — skills directly transferable to engineering
                  environments.
                </li>
              </ul>
            </div>

            {/* Education */}
            <div
              className={`tab-contents ${
                activeTab === "education" ? "active-tab" : ""
              }`}
              id="education"
            >
              <ul>
                <li>
                  <span>2018 – 2020</span>
                  <br />
                  <strong>Saddleback Community College</strong>
                  <br />
                  <em>General Education, Transfer Pathway</em>
                </li>
                <li>
                  <span>2022 – 2023</span>
                  <br />
                  <strong>Saddleback Community College</strong>
                  <br />
                  <em>Computer Science Coursework</em>
                </li>
                <li>
                  <span>2023 – 2025</span>
                  <br />
                  <strong>California State University Fullerton</strong>
                  <br />
                  <em>Bachelor of Science in Computer Science</em>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
