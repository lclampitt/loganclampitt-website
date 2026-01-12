import React, { useState } from "react";
import "../styles/header.css";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenuOpen = () => setMenuOpen(true);
  const handleMenuClose = () => setMenuOpen(false);

  const handleNavClick = () => {
    // close mobile menu when clicking a nav link
    setMenuOpen(false);
  };

  return (
    <div id="header">
      <div className="container">
        <nav>
          <img src="/images/logo.png" className="logo" alt="Logo" />

          <ul id="sidemenu" className={menuOpen ? "open" : ""}>
            <li>
              <a href="#header" onClick={handleNavClick}>
                Home
              </a>
            </li>
            <li>
              <a href="#about" onClick={handleNavClick}>
                About
              </a>
            </li>
            <li>
              <a href="#services" onClick={handleNavClick}>
                Services
              </a>
            </li>
            <li>
              <a href="#sim-racing" onClick={handleNavClick}>
                Sim Racing
              </a>
            </li>
            <li>
              <a href="#projects" onClick={handleNavClick}>
                Projects
              </a>
            </li>
            <li>
              <a href="#contact" onClick={handleNavClick}>
                Contact
              </a>
            </li>
            <i className="fas fa-times" onClick={handleMenuClose}></i>
          </ul>

          <i className="fas fa-bars" onClick={handleMenuOpen}></i>
        </nav>

        <div className="header-text">
          <p>Developer | Sim Racer</p>
          <h1>
            <span>Logan</span> Clampitt
          </h1>
        </div>
      </div>
    </div>
  );
}
