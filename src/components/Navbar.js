import React, { useState } from "react";
import "./Navbar.css";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const [dispNav, changeNav] = useState("normal");
  const [customclass, changeClass] = useState("invisible");
  const location = useLocation();
  const stl = {
    "backgroundColor":"rgb(106 31 62)",
    "color":"white",
    "width":"100%",
    "textAlign":"center"
  }
  const displayNav = () => {
    if (dispNav === "normal") {
      changeClass("links");
      changeNav("ultimate");
    } else {
      changeClass("invisible");
      changeNav("normal");
    }
  };

  return (
    <>
      {location.pathname === "/" || location.pathname === "/Signup" ? (
        <div style={stl}>Welcome to Customtalks</div>
      ) : (
        <nav>
          <ul>
            <li id="logo">Custom Talks</li>
            <li className={customclass}>
              <Link to="/Home">Home</Link>
            </li>
            <li className={customclass}>
              <Link to="/Search">Search</Link>
            </li>
            <li className={customclass}>
              <Link to="/Profile">Profile</Link>
            </li>
            <li className={customclass}>
              <Link to="/Notifications">Notifications</Link>
            </li>
          </ul>
          <i onClick={displayNav} className="fa-solid fa-bars icon"></i>
        </nav>
      )}
    </>
  );
}
