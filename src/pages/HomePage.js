// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import Lottie from 'lottie-react';
// import logo from '../assets/logo.png';
// import jumpingAnimation from '../assets/jumpingNigga.json';
// import CategorySelector from '../components/CategorySelector';
// import RotationPrompt from '../components/RotationPrompt';
// import useDeviceInfo from '../hooks/useDeviceInfo';
// import useDynamicCSS from '../hooks/useDynamicCSS';
// import './HomePage.css';

// function HomePage() {
//   const deviceInfo = useDeviceInfo();
//   useDynamicCSS(); // Initialize dynamic CSS system
  
//   const [topButtonHovered, setTopButtonHovered] = useState(false);
//   const [bottomButtonHovered, setBottomButtonHovered] = useState(false);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [selectedCategories, setSelectedCategories] = useState([]);
//   const [teamNames, setTeamNames] = useState({ team1: '', team2: '' });
//   const [serverWaking, setServerWaking] = useState(true);
//   const [wakeUpError, setWakeUpError] = useState('');
//   const [showRandomPrompt, setShowRandomPrompt] = useState(false);

//   const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://fiveo5a.onrender.com';

//   // Wake up the server when component mounts
//   useEffect(() => {
//     const wakeUpServer = async () => {
//       try {
//         console.log('Waking up server...');
//         setServerWaking(true);
//         setWakeUpError('');
        
//         const response = await fetch(`${BACKEND_URL}/wake-up`, {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         });

//         const data = await response.json();
        
//         if (data.success) {
//           console.log('Server is awake:', data);
//           setServerWaking(false);
//         } else {
//           throw new Error(data.message || 'Failed to wake up server');
//         }
//       } catch (error) {
//         console.error('Error waking up server:', error);
//         setWakeUpError(error.message || 'Failed to connect to server');
//         setServerWaking(false);
//       }
//     };

//     wakeUpServer();
//   }, [BACKEND_URL]);

//   const handlePasswordSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!password.trim()) {
//       setError('Please enter a referral code.');
//       return;
//     }

//     setLoading(true);
//     setError('');
    
//     try {
//       const response = await fetch(`${BACKEND_URL}/verify-referral`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ code: password }),
//       });

//       const data = await response.json();
      
//       if (response.ok && data.valid) {
//         setIsAuthenticated(true);
//         setError('');
//       } else {
//         setError(data.message || 'Invalid referral code. Try again!');
//       }
//     } catch (error) {
//       console.error('Authentication error:', error);
//       setError('Connection error. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCategoryChange = (categories) => {
//     setSelectedCategories(categories);
//   };

//   const handleTeamNamesChange = (newTeamNames) => {
//     setTeamNames(newTeamNames);
//   };

//   const handleClosePrompt = () => {
//     setShowRandomPrompt(false);
//   };

//   const canStartGame = selectedCategories.length > 0 && 
//     (teamNames.team1.trim() !== '' || teamNames.team2.trim() !== '');

//   // Authentication check
//   useEffect(() => {
//     const checkAuth = () => {
//       const urlParams = new URLSearchParams(window.location.search);
//       const authParam = urlParams.get('auth');
      
//       if (authParam === 'true') {
//         setIsAuthenticated(true);
//         setServerWaking(false);
//       } else {
//         setIsAuthenticated(false);
//       }
//     };
    
//     checkAuth();
//   }, []);

//   // If not authenticated, show password screen
//   if (!isAuthenticated) {
//     return (
//       <div className="container">
//         <div className="auth-modal">
//           <img src={logo} alt="Game Logo" className="auth-logo" />
          
//           {serverWaking ? (
//             <>
//               <Lottie 
//                 animationData={jumpingAnimation} 
//                 className="loading-animation"
//                 loop={true}
//                 autoplay={true}
//               />
//               <h2 className="auth-title">
//                 Waking Up Server...
//               </h2>
//               <p className="loading-text">
//                 Please wait while we prepare everything for you
//               </p>
//             </>
//           ) : wakeUpError ? (
//             <>
//               <h2 className="auth-title" style={{ color: '#e74c3c' }}>
//                 Connection Error
//               </h2>
//               <div className="error-message">
//                 {wakeUpError}
//               </div>
//               <button
//                 onClick={() => window.location.reload()}
//                 className="auth-button"
//               >
//                 Try Again
//               </button>
//             </>
//           ) : (
//             <>
//               <h2 className="auth-title">
//                 We're Not Open Yet 👀
//               </h2>

//               <p className="auth-subtitle">
//                 If you have a Password, enter it below for <b>Exclusive access</b>
//               </p>

//               <form onSubmit={handlePasswordSubmit}>
//                 <input
//                   className="password-input"
//                   value={password}
//                   type='password'
//                   onChange={(e) => setPassword(e.target.value)}
//                   placeholder="Enter password"
//                 />
                
//                 {error && (
//                   <div className="error-message">
//                     {error}
//                   </div>
//                 )}
                
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="auth-button"
//                 >
//                   {loading ? 'Verifying...' : 'Ready To Play'}
//                 </button>
//               </form>
//             </>
//           )}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container">
//       {showRandomPrompt && (
//         <RotationPrompt onClose={handleClosePrompt} />
//       )}
      
//       {/* Logo Section */}
//       <section className="logo-section">
//         <img src={logo} alt="Game Logo" className="logo" />

//       </section>

//       {/* Category Selection Section */}
//       <section className="category-section">

        
//         <CategorySelector 
//           selectedCategories={selectedCategories}
//           onCategoryChange={handleCategoryChange}
//           onTeamNamesChange={handleTeamNamesChange}
//           teamNames={teamNames}
//         />
//       </section>

//       {/* Start Game CTA */}
//       <section className="cta-section">
//         <Link 
//           to={canStartGame ? "/hello" : "#"}
//           className={`start-game-button ${canStartGame ? 'active' : 'disabled'}`}
//           state={{ selectedCategories, teamNames }}
//         >
//           Start Game 
//         </Link>
//       </section>
//     </div>
//   );
// }

// export default HomePage;


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import logo from '../assets/logo.png';
import jumpingAnimation from '../assets/jumpingNigga.json';
import CategorySelector from '../components/CategorySelector';
import RotationPrompt from '../components/RotationPrompt';
import useDeviceInfo from '../hooks/useDeviceInfo';
import useDynamicCSS from '../hooks/useDynamicCSS';
import './HomePage.css';

function HomePage() {

  const deviceInfo = useDeviceInfo();
  const width = deviceInfo?.screen?.availableWidth;
  const height = deviceInfo?.screen?.availableHeight;
  console.log('Width:', width);
  console.log('Height:', height);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: `${height * 0.35}px`,
      width: '100vw',
      gap: '10px',
      boxSizing: 'border-box'
    }}>
      
      {/* Section 1 */}
      <div style={{
        backgroundColor: '#ff6b6b',
        width: '80%',
        height: `${height / 15}px`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '10px'
      }}>
        <h2 style={{ color: 'white', margin: 0 }}>Section 1</h2>
      </div>

      {/* Section 2 */}
      <div style={{
        backgroundColor: '#4ecdc4',
        width: '80%',
        height: `${height / 6}px`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '10px'
      }}>
        <h2 style={{ color: 'white', margin: 0 }}>Section 2</h2>
      </div>

      {/* Section 3 */}
      <div style={{
        backgroundColor: '#45b7d1',
        width: '80%',
        height: `${height / 15}px`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '10px'
      }}>
        <h2 style={{ color: 'white', margin: 0 }}>Section 3</h2>
      </div>

    </div>
  );
}

export default HomePage;
