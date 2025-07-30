import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

function HomePage() {
  return (
    <div className="container">
      <img src={logo} alt="Game Logo" style={{
        height: '120px',
        width: 'auto',
        marginBottom: '20px',
        filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))'
      }} />
      
      <div style={{ marginTop: '30px', display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/hello" style={{ 
          background: '#2d6cdf', 
          color: 'white', 
          padding: '15px 25px', 
          borderRadius: '10px', 
          textDecoration: 'none',
          fontWeight: '600',
          transition: 'all 0.3s ease'
        }}>
          Single Player Game
        </Link>
        
        <Link to="/multiplayer" style={{ 
          background: '#28a745', 
          color: 'white', 
          padding: '15px 25px', 
          borderRadius: '10px', 
          textDecoration: 'none',
          fontWeight: '600',
          transition: 'all 0.3s ease'
        }}>
          Host Multiplayer Game
        </Link>
      </div>
    </div>
  );
}

export default HomePage;
