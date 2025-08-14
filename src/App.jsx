import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import Auth from "./pages/auth/auth.jsx";
import GameSetup from "./pages/GameSetup/GameSetup.jsx";
import Game from "./pages/Game/Game.jsx";
import QuestionDisplayTest from "./pages/QuestionDisplayTest/QuestionDisplayTest.jsx";
import AdminDashboard from "./pages/admin/admin.jsx";

function HomePage() {
  return (
    <div className="home">
      <h1>Welcome to the Home Page</h1>
      <p>This is the home page of your application.</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Auth />} />
          {/* <Route path="/dimensions" element={<Dimensions />} /> */}
          <Route path="/game-setup" element={<GameSetup />} />
          <Route path="/game" element={<Game />} />
          <Route path="/question-test" element={<QuestionDisplayTest />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
