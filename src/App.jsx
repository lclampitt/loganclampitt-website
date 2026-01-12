import React from "react";
import Header from "./components/Header.jsx";
import About from "./components/About.jsx";
import Services from "./components/Services.jsx";
import SimRacing from "./components/SimRacing.jsx";
import Projects from "./components/Projects.jsx";
import Contact from "./components/Contact.jsx";

export default function App() {
  return (
    <>
      <Header />
      <About />
      <Services />
      <SimRacing />
      <Projects />
      <Contact />
    </>
  );
}
