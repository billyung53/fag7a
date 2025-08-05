import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import jumpingAnimation from '../assets/jumpingNigga.json';
import './LoadingScreen.css';

const LoadingScreen = ({ isVisible = true, progress = 0 }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const loadingTexts = [
    "Asking scientists to double check our answers.",
    "Checking with KPMG one last time",
    "Out on lunch break brb...",
    "We're done we just like making you wait",
    "Teaching our AI some manners",
    "Counting to infinity twice.",
    "Polishing our questions until they shine",
    "Having a philosophical debate about answers",
    "Checking if our facts are still facts.",
    "Asking Google if we're doing this right",
  ];

  // Typewriter effect
  useEffect(() => {
    if (!isVisible) return;

    const currentText = loadingTexts[currentTextIndex];
    let charIndex = 0;
    setDisplayedText('');
    setIsTyping(true);

    const typewriterInterval = setInterval(() => {
      if (charIndex < currentText.length) {
        setDisplayedText(currentText.slice(0, charIndex + 1));
        charIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typewriterInterval);
        
        // Wait 5 seconds before switching to next text
        setTimeout(() => {
          setCurrentTextIndex((prev) => (prev + 1) % loadingTexts.length);
        }, 5000);
      }
    }, 80); // Typing speed

    return () => clearInterval(typewriterInterval);
  }, [currentTextIndex, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="loading-screen">
      <div className="loading-content">

        {/* Main Loading Animation */}
        <div className="main-animation">
          <Lottie 
            animationData={jumpingAnimation} 
            loop={true}
            className="jumping-animation"
          />
        </div>

        {/* Loading Text with Typewriter Effect */}
        <div className="loading-text-container">
            <h1 className="loading-static-text">Building the Game🔨</h1>
          <p className="loading-text">
            {displayedText}
            <span className={`cursor ${isTyping ? 'blinking' : 'hidden'}`}>|</span>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="progress-text">{Math.round(progress)}%</div>
        </div>


      </div>
    </div>
  );
};

export default LoadingScreen;
