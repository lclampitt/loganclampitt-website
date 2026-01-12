import React, { useState } from "react";
import "../styles/contact.css";

export default function Contact() {
  const [formStatus, setFormStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const scriptURL =
      "https://script.google.com/macros/s/AKfycbxq-tDM99PS3FwCrXTAlZYEnap3NvTTiVMBsGjvpY5q_OBMr2GEGPoEeP7URrf2AuZCww/exec";

    const form = e.target;
    try {
      await fetch(scriptURL, {
        method: "POST",
        body: new FormData(form),
      });
      setFormStatus("Message sent successfully");
      setTimeout(() => setFormStatus(""), 5000);
      form.reset();
    } catch (err) {
      console.error("Error!", err.message);
      setFormStatus("Something went wrong. Please try again.");
    }
  };

  return (
    <div id="contact">
      <div className="container">
        <div className="row">
          <div className="contact-left">
            <h1 className="sub-title">Contact Me</h1>
            <p>
              <i className="fa-solid fa-paper-plane"></i> logannc44@yahoo.com
            </p>
            <div className="social-icons">
              <a href="https://x.com/LoganClampitt_">
                <i className="fa-brands fa-x-twitter"></i>
              </a>
              <a href="https://www.instagram.com/loganclampitt_/">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="https://www.linkedin.com/in/loganclampitt/">
                <i className="fa-brands fa-linkedin"></i>
              </a>
            </div>
            <a
              href="/images/Logan Clampitt Resume - 2024 (1).pdf"
              download
              className="btn btn2"
            >
              Download Resume
            </a>
          </div>

          <div className="contact-right">
            <form name="submit-to-google-sheet" onSubmit={handleSubmit}>
              <input type="text" name="Name" placeholder="Your Name" required />
              <input
                type="email"
                name="Email"
                placeholder="Your Email"
                required
              />
              <textarea
                name="Message"
                rows="6"
                placeholder="Your Message"
              ></textarea>
              <button type="submit" className="btn btn2">
                Submit
              </button>
            </form>
            <span id="msg">{formStatus}</span>
          </div>
        </div>
      </div>
      <div className="copyright">
        <p></p>
      </div>
    </div>
  );
}
