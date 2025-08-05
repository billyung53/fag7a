import React, { useState, useEffect } from 'react';
import peachImage from '../assets/peach.png';
import './FloatingPeaches.css';

function FloatingPeaches() {
  const [peaches, setPeaches] = useState([]);

  useEffect(() => {
    const createPeach = () => {
      const newPeach = {
        id: Date.now() + Math.random(),
        left: Math.random() * 100, // Random horizontal position (0-100%)
        animationDuration: 8 + Math.random() * 4, // 8-12 seconds fall time
        size: 30 + Math.random() * 20, // 30-50px size
        rotation: Math.random() * 360, // Random initial rotation
      };

      setPeaches(prev => [...prev, newPeach]);

      // Remove the peach after animation completes
      setTimeout(() => {
        setPeaches(prev => prev.filter(peach => peach.id !== newPeach.id));
      }, newPeach.animationDuration * 1000);
    };

    // Create first peach after 5 seconds
    const initialTimeout = setTimeout(createPeach, 5000);

    // Then create peaches every 30-60 seconds
    const interval = setInterval(() => {
      createPeach();
    }, 20000 + Math.random() * 10000); // 20-30 seconds

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="floating-peaches-container">
      {peaches.map(peach => (
        <div
          key={peach.id}
          className="floating-peach"
          style={{
            left: `${peach.left}%`,
            animationDuration: `${peach.animationDuration}s`,
            width: `${peach.size}px`,
            height: `${peach.size}px`,
            transform: `rotate(${peach.rotation}deg)`,
          }}
        >
          <img src={peachImage} alt="Floating Peach" />
        </div>
      ))}
    </div>
  );
}

export default FloatingPeaches;
