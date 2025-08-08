import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './styles/deviceOptimized.css';
import HomePage from './pages/HomePage';
import HelloPage from './pages/HelloPage';
import LoadingScreenTest from './pages/LoadingScreenTest';
import DeviceInfoWrapper from './components/DeviceInfoPanel/DeviceInfoWrapper';
import useDynamicCSS from './hooks/useDynamicCSS';
import Authentication from './pages/AuthenticationNabil';

function App() {
  // Apply dynamic CSS based on device info globally
  const deviceInfo = useDynamicCSS();

  return (
    <Router>
      <div className="App device-constrained" style={{ backgroundColor: '#ffd3ac' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/hello" element={<HelloPage />} />
          <Route path="/loading-test" element={<LoadingScreenTest />} />
          <Route path="/authenticationNabil" element={<Authentication />} />

        </Routes>
        
        {/* Development Tools - Only shows when enabled in devConfig */}
        <DeviceInfoWrapper />
      </div>
    </Router>
  );
}

export default App;
