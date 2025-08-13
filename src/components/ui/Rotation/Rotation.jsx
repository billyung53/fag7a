import React from "react";
import "./Rotation.css";
import peach from "../../../assets/peach.png";


const Rotation = () => {
  return (
    <div className="rotation-overlay">
      <div className="rotation-content">
        <div className="peach-emoji">
          <img className="peach-image" src={peach} alt="Peach Emoji" />
        </div>
        <h1 className="rotation-title">Rotate the screen</h1>
        <div className="rotation-icon">
          🔄
        </div>
      </div>
    </div>
  );
};

export default Rotation;
