import React from "react";
import { Routes, Route } from "react-router-dom";

import Header from "./components/Header.jsx";
import About from "./components/About.jsx";
import Services from "./components/Services.jsx";
import SimRacing from "./components/SimRacing.jsx";
import Projects from "./components/Projects.jsx";
import Contact from "./components/Contact.jsx";

import EnascCollege from "./pages/EnascCollege.jsx";
import EnascCocaCola from "./pages/EnascCocaCola.jsx";
import Connect4AI from "./pages/Connect4AI.jsx";
import Gainlytics from "./pages/Gainlytics.jsx";
import OtherExperience from "./pages/OtherExperience.jsx";

function Home() {
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/enasc-college" element={<EnascCollege />} />
      <Route path="/enasc-coca-cola" element={<EnascCocaCola />} />
      <Route path="/connect4ai" element={<Connect4AI />} />
      <Route path="/gainlytics" element={<Gainlytics />} />
      <Route path="/other-experience" element={<OtherExperience />} />
    </Routes>
  );
}
