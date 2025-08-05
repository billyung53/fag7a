import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import logo from '../assets/logo.png';
import jumpingAnimation from '../assets/jumpingNigga.json';
import CategorySelector from '../components/CategorySelector';

function HomePage() {
  const [topButtonHovered, setTopButtonHovered] = useState(false);
  const [bottomButtonHovered, setBottomButtonHovered] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [teamNames, setTeamNames] = useState({ team1: '', team2: '' });
  const [serverWaking, setServerWaking] = useState(true);
  const [wakeUpError, setWakeUpError] = useState('');

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://fiveo5a.onrender.com';

  // Wake up the server when component mounts
  useEffect(() => {
    const wakeUpServer = async () => {
      try {
        console.log('Waking up server...');
        setServerWaking(true);
        setWakeUpError('');
        
        const response = await fetch(`${BACKEND_URL}/wake-up`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        
        if (data.success) {
          console.log('Server is awake:', data);
          setServerWaking(false);
        } else {
          throw new Error(data.message || 'Failed to wake up server');
        }
      } catch (error) {
        console.error('Error waking up server:', error);
        setWakeUpError(error.message || 'Failed to connect to server');
        setServerWaking(false);
      }
    };

    wakeUpServer();
  }, [BACKEND_URL]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Please enter a referral code.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${BACKEND_URL}/verify-referral`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: password.toLowerCase() }),
      });

      const data = await response.json();
      
      if (data.valid) {
        setIsAuthenticated(true);
        setError('');
        // You can store referral data if needed
        if (data.referralData) {
          console.log('Referral data:', data.referralData);
        }
      } else {
        setError('Invalid referral code. Please try again.');
        setPassword('');
      }
    } catch (error) {
      console.error('Error verifying referral code:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categories) => {
    setSelectedCategories(categories);
  };

  const handleTeamNamesChange = (names) => {
    setTeamNames(names);
  };

  const canStartGame = selectedCategories.length === 5 && teamNames.team1 && teamNames.team2;

  // If not authenticated, show password screen
  if (!isAuthenticated) {
    return (
      <div className="container" style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}>
        <style>{`
          .password-input::placeholder { color: #f04f30 !important; opacity: 0.7 !important; }
          .password-input::-webkit-input-placeholder { color: #f04f30 !important; opacity: 0.7 !important; }
          .password-input::-moz-placeholder { color: #f04f30 !important; opacity: 0.7 !important; }
          .password-input:-ms-input-placeholder { color: #f04f30 !important; opacity: 0.7 !important; }
          .loading-animation {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px auto;
          }
          .pulse {
            animation: pulse 1.5s ease-in-out infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
        `}</style>
        
        <div style={{
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          textAlign: 'center',
          maxWidth: '400px',
          width: '90%'
        }}>
          <img src={logo} alt="Game Logo" style={{
            height: '120px',
            width: 'auto',
            marginBottom: '10px',
          }} />
          
          {serverWaking ? (
            <>
              <Lottie 
                animationData={jumpingAnimation} 
                className="loading-animation"
                loop={true}
                autoplay={true}
              />
              <h2 style={{
                margin: '0 0 20px 0',
                color: '#f04f30',
                fontSize: '24px',
                fontWeight: '600'
              }}>
                Waking Up Server...
              </h2>
              <p className="pulse" style={{ color: '#666', fontSize: '16px' }}>
                Please wait while we prepare everything for you
              </p>
            </>
          ) : wakeUpError ? (
            <>
              <h2 style={{
                margin: '0 0 20px 0',
                color: '#e74c3c',
                fontSize: '24px',
                fontWeight: '600'
              }}>
                Connection Error
              </h2>
              <div style={{
                color: '#e74c3c',
                fontSize: '14px',
                marginBottom: '20px',
                padding: '15px',
                background: 'rgba(231, 76, 60, 0.1)',
                borderRadius: '10px'
              }}>
                {wakeUpError}
              </div>
              <button
                onClick={() => window.location.reload()}
                style={{
                  width: '100%',
                  padding: '15px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'white',
                  background: '#f04f30',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease'
                }}
                onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
                onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                Try Again
              </button>
            </>
          ) : (
            <>
              <h2 style={{
                margin: '0 0 20px 0',
                color: '#f04f30',
                fontSize: '24px',
                fontWeight: '600'
              }}>
                We're Not Open Yet 👀
              </h2>

              <p>If you have a Password, enter it below for <b>Exclusive access</b></p>

              <form onSubmit={handlePasswordSubmit}>
                <input
                  className="password-input"
                  value={password}
                  type='password'
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 109, 77, 0.2)',
                    padding: '15px',
                    fontSize: '16px',
                    textAlign: 'center',
                    border: '2px solid #fff',
                    borderRadius: '10px',
                    marginBottom: '15px',
                    outline: 'none',
                    transition: 'border-color 0.3s ease',
                    boxSizing: 'border-box',
                    color: '#333'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#f04f30'}
                  onBlur={(e) => e.target.style.borderColor = '#fff'}
                />
                
                {error && (
                  <div style={{
                    color: '#e74c3c',
                    fontSize: '14px',
                    marginBottom: '15px',
                    padding: '10px',
                    background: 'rgba(231, 76, 60, 0.1)',
                    borderRadius: '5px'
                  }}>
                    {error}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '15px',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: 'white',
                    background: loading ? '#999' : '#f04f30',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'transform 0.2s ease',
                    opacity: loading ? 0.7 : 1
                  }}
                  onMouseDown={(e) => !loading && (e.target.style.transform = 'scale(0.98)')}
                  onMouseUp={(e) => !loading && (e.target.style.transform = 'scale(1)')}
                  onMouseLeave={(e) => !loading && (e.target.style.transform = 'scale(1)')}
                >
                  {loading ? 'Verifying...' : 'Ready To Play'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <img src={logo} alt="Game Logo" style={{
        height: '200px',
        width: 'auto',
        marginBottom: '20px',
      }} />

      {/* Category Selection Section */}
      <CategorySelector 
        selectedCategories={selectedCategories}
        onCategoryChange={handleCategoryChange}
        onTeamNamesChange={handleTeamNamesChange}
        teamNames={teamNames}
      />

      <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        
        <Link 
          to={canStartGame ? "/hello" : "#"}
          style={{ 
            background: canStartGame ? '#f04f30' : '#ccc',
            color: 'white', 
            padding: '20px 40px', 
            borderRadius: '15px', 
            textDecoration: 'none',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            fontSize: '28px',
            width: '280px',
            textAlign: 'center',
            transform: topButtonHovered && canStartGame ? 'scale(1.05)' : 'scale(1)',
            cursor: canStartGame ? 'pointer' : 'not-allowed',
            opacity: canStartGame ? 1 : 0.6,
            pointerEvents: canStartGame ? 'auto' : 'none'
          }}
          state={{ selectedCategories, teamNames }} // Pass categories and team names to next page
        >
          Start Game 
        </Link>

      </div>
    </div>
  );
}

export default HomePage;