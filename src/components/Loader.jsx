// src/components/ThemedCircularLoader.jsx
import React from "react";
import "./Loader.css";

const Loader = () => {
  return (
    <div className="themed-loader-overlay">
      <div className="themed-circular-spinner"></div>
      <p className="loader-text">Loading...</p>
    </div>
  );
};

export default Loader;
