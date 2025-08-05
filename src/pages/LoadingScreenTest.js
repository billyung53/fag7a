import React, { useState, useEffect } from 'react';
import LoadingScreen from '../components/LoadingScreen';

function LoadingScreenTest() {
  const [progress, setProgress] = useState(0);

  // Simulate progress animation for testing - slower and more realistic
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          return 0; // Reset to 0 to loop the animation
        }
        return prev + Math.random() * 2; // Slower increment ~1% per second
      });
    }, 400); // Update every 1 second

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <LoadingScreen isVisible={true} progress={progress} />
      
      {/* Debug Controls */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 10000,
        fontFamily: 'monospace',
        fontSize: '12px'
      }}>
        <div>Progress: {Math.round(progress)}%</div>
        <button 
          onClick={() => setProgress(0)}
          style={{
            marginTop: '5px',
            padding: '5px 10px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Reset Progress
        </button>
        <button 
          onClick={() => setProgress(100)}
          style={{
            marginTop: '5px',
            marginLeft: '5px',
            padding: '5px 10px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Complete
        </button>
      </div>
    </div>
  );
}

export default LoadingScreenTest;
