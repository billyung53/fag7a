import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import HelloPage from './pages/HelloPage';
import MultiplayerGame from './pages/MultiplayerGame';
import TeamPage from './pages/TeamPage';
import LoadingScreenTest from './pages/LoadingScreenTest';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/hello" element={<HelloPage />} />
          <Route path="/multiplayer" element={<MultiplayerGame />} />
          <Route path="/join" element={<TeamPage />} />
          <Route path="/loading-test" element={<LoadingScreenTest />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
