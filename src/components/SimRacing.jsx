import React from "react";
import { Link } from "react-router-dom";

export default function SimRacing() {
  const bubbleStyle = {
    width: 56,
    height: 56,
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff",
    textDecoration: "none",
    color: "#000",
  };

  const iconStyle = {
    color: "#000",
    fontSize: 18,
    lineHeight: 1,
  };

  return (
    <div id="sim-racing">
      <div className="container">
        <h1 className="sub-title">Sim Racing</h1>

        <div className="racing-list">
          {/* ENASCAR College */}
          <div className="racing">
            <img
              src="/images/ENASCARCHAMPIONSHIP2025.png"
              alt="ENASCAR College"
            />
            <div className="layer layer-orange">
              <h3>ENASCAR College iRacing Series</h3>

              <Link
                to="/enasc-college"
                style={bubbleStyle}
                aria-label="Open ENASCAR College page"
              >
                <i
                  className="fa-solid fa-up-right-from-square"
                  style={iconStyle}
                ></i>
              </Link>
            </div>
          </div>

          {/* ENASCAR Coca-Cola */}
          <div className="racing">
            <img
              src="/images/Coke_LasVegas_42eRacr_LoganClampitt1_022525.png"
              alt="Coca-Cola Series"
            />
            <div className="layer layer-red">
              <h3>ENASCAR Coca-Cola iRacing Series</h3>

              <Link
                to="/enasc-coca-cola"
                style={bubbleStyle}
                aria-label="Open ENASCAR Coca-Cola page"
              >
                <i
                  className="fa-solid fa-up-right-from-square"
                  style={iconStyle}
                ></i>
              </Link>
            </div>
          </div>

          {/* Other Experience */}
          <div className="racing">
            <img src="/images/LOU_2776.2.jpg" alt="Other Racing Experience" />
            <div className="layer layer-green">
              <h3>Other Experience</h3>

              <Link
                to="/other-experience"
                style={bubbleStyle}
                aria-label="Open Other Experience page"
              >
                <i
                  className="fa-solid fa-up-right-from-square"
                  style={iconStyle}
                ></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
