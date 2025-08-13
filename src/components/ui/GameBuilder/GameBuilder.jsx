import React, { useState, useEffect } from "react";
import "./GameBuilder.css";
import { BUILDING_GAME } from "../../../data/lists";

const GameBuilder = ({ onComplete }) => {
  const [displayedMessage, setDisplayedMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  // Shuffle messages array to get random order
  const [shuffledMessages] = useState(() => {
    const messages = [...BUILDING_GAME];
    for (let i = messages.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [messages[i], messages[j]] = [messages[j], messages[i]];
    }
    return messages;
  });

  // Progress animation (35 seconds total)
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 100 / (35 * 10); // 35 seconds * 10 updates per second
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          if (onComplete) {
            setTimeout(() => onComplete(), 500); // Small delay after completion
          }
          return 100;
        }
        return newProgress;
      });
    }, 100); // Update every 100ms for smooth animation

    return () => clearInterval(progressInterval);
  }, [onComplete]);

  // Update percentage display
  useEffect(() => {
    setPercentage(Math.round(progress));
  }, [progress]);

  // Typewriter effect for messages
  useEffect(() => {
    if (shuffledMessages.length === 0) return;

    const message = shuffledMessages[messageIndex % shuffledMessages.length];
    setDisplayedMessage("");
    setIsTyping(true);

    let charIndex = 0;
    const typingInterval = setInterval(() => {
      setDisplayedMessage(message.substring(0, charIndex + 1));
      charIndex++;

      if (charIndex >= message.length) {
        clearInterval(typingInterval);
        setIsTyping(false);

        // Wait 2-3 seconds before next message
        setTimeout(() => {
          setMessageIndex((prev) => prev + 1);
        }, 2500);
      }
    }, 50); // Typing speed

    return () => clearInterval(typingInterval);
  }, [messageIndex, shuffledMessages]);

  return (
    <div className="game-builder">
      <div className="game-builder-content">
        {/* Peach Logo */}
        <div className="peach-logo">
          <img
            src="/src/assets/peach.png"
            alt="Peach Logo"
            className="peach-image"
          />
        </div>

        {/* Title */}
        <div className="title-section">
          <h1 className="main-title">Building the</h1>
          <h1 className="main-title">Game</h1>
        </div>

        {/* Dynamic Message with Typewriter Effect */}
        <div className="message-section">
          <p className="dynamic-message">
            {displayedMessage}
            {isTyping && <span className="cursor">|</span>}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-container">
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Percentage */}
          <div className="percentage-display">{percentage}%</div>
        </div>
      </div>
    </div>
  );
};

export default GameBuilder;
