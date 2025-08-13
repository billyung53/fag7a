import React, { useState, useEffect } from "react";
import peach from "../assets/peach.png";


const LoadingScreen = ({
  messages = ["Loading...", "Please wait...", "Almost there..."],
}) => {
  const [displayText, setDisplayText] = useState("");
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [randomizedMessages, setRandomizedMessages] = useState([]);

  // Randomize messages on component mount
  useEffect(() => {
    const shuffled = [...messages].sort(() => Math.random() - 0.5);
    setRandomizedMessages(shuffled);
  }, [messages]);

  // Typewriter effect
  useEffect(() => {
    if (randomizedMessages.length === 0) return;

    const currentMessage = randomizedMessages[currentMessageIndex];

    if (charIndex < currentMessage.length) {
      const timeout = setTimeout(() => {
        setDisplayText(currentMessage.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, 100); // Typing speed
      return () => clearTimeout(timeout);
    } else {
      // Message complete, wait then move to next message
      const timeout = setTimeout(() => {
        setCharIndex(0);
        setDisplayText("");
        setCurrentMessageIndex(
          (prev) => (prev + 1) % randomizedMessages.length
        );
      }, 2000); // Wait 2 seconds before next message
      return () => clearTimeout(timeout);
    }
  }, [charIndex, currentMessageIndex, randomizedMessages]);

  return (
    <div className="loading-container">
      <div className="loading-content">
        <img
          src={peach}
          alt="Peach logo"
          className="loading-logo"
          width="80"
          height="80"
        />
        <h2>Waking up our servers</h2>
        <span className="typewriter-text">{displayText}</span>
        <div className="loading-spinner"></div>
      </div>

      <style jsx>{`
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }

        .loading-content {
          text-align: center;
          padding: 2rem;
        }

        .loading-logo {
          margin-bottom: 1rem;
          opacity: 0.8;
        }

        .loading-content h2 {
          margin: 1rem 0 0.5rem 0;
          font-size: 1.5rem;
          color: #333;
        }

        .typewriter-text {
          display: block;
          min-height: 1.5rem;
          margin-bottom: 1rem;
          font-size: 1rem;
          color: #666;
          font-style: italic;
        }

        .typewriter-text::after {
          content: "|";
          animation: blink 1s infinite;
          margin-left: 2px;
        }

        @keyframes blink {
          0%,
          50% {
            opacity: 1;
          }
          51%,
          100% {
            opacity: 0;
          }
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #1e1e1e;
          border-top: 4px solid #e74c3c;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
