import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./auth.css";
import LoadingScreen from "../../components/LoadingScreen";
import { WAKE_UP } from "../../data/lists";
import peach from "../../assets/peach.png";



export default function Auth() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [serverWaking, setServerWaking] = useState(true);
  const [wakeUpError, setWakeUpError] = useState("");
  const [loading, setLoading] = useState(false); // Added missing loading state
  const [floatingPills, setFloatingPills] = useState([]); // For floating pills

  const BACKEND_URL = "https://fiveo5a.onrender.com";

  // Comedic floating pill function
  const createFloatingPill = () => {
    const pillId = Date.now() + Math.random();
    const newPill = {
      id: pillId,
      x: Math.random() * (window.innerWidth - 200), // Random horizontal position
      y: -50, // Start above viewport
    };

    setFloatingPills((prev) => [...prev, newPill]);

    // Remove pill after animation completes
    setTimeout(() => {
      setFloatingPills((prev) => prev.filter((pill) => pill.id !== pillId));
    }, 4000);
  };

  // Authentication check
  useEffect(() => {
    const checkAuth = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authParam = urlParams.get("auth");

      if (authParam === "true") {
        setIsAuthenticated(true);
        setServerWaking(false);
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Wake up the server when component mounts
  useEffect(() => {
    const wakeUpServer = async () => {
      try {
        console.log("Waking up server...");
        setServerWaking(true);
        setWakeUpError("");

        const response = await fetch(`${BACKEND_URL}/wake-up`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (data.success) {
          console.log("Server is awake:", data);
          setServerWaking(false);
        } else {
          throw new Error(data.message || "Failed to wake up server");
        }
      } catch (error) {
        console.error("Error waking up server:", error);
        setWakeUpError(error.message || "Failed to connect to server");
        setServerWaking(false);
      }
    };

    wakeUpServer();
  }, [BACKEND_URL]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!password.trim()) {
      setError("Please enter a referral code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${BACKEND_URL}/verify-referral`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: password }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setIsAuthenticated(true);
        setError("");
        console.log("Referral code accepted:", data);
        setSuccess("Referral code accepted! Redirecting...");

        // Redirect to GameSetup after a short delay
        setTimeout(() => {
          navigate("/game-setup");
        }, 1500);
      } else {
        setError(data.message || "Invalid referral code. Try again!");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "5o5a";
    const metaDesc =
      document.querySelector('meta[name="description"]') ||
      Object.assign(document.createElement("meta"), { name: "description" });
    metaDesc.setAttribute(
      "content",
      "Enter a referral code for exclusive access."
    );
    if (!metaDesc.isConnected) document.head.appendChild(metaDesc);

    const link =
      document.querySelector("link[rel='canonical']") ||
      Object.assign(document.createElement("link"), { rel: "canonical" });
    link.setAttribute("href", window.location.origin + "/auth");
    if (!link.isConnected) document.head.appendChild(link);
  }, []);

  return (
    <div className="auth">
      {/* Show loading screen while server is waking up */}
      {serverWaking ? (
        <LoadingScreen messages={WAKE_UP} />
      ) : (
        <>
          <header className="topbar" role="banner">
            <div className="topbar-inner">
              <button
                aria-label="Menu"
                className="hamburger"
                type="button"
                onClick={createFloatingPill}
              >
                <span />
                <span />
                <span />
              </button>

              <img
                src={peach}
                alt="Peach logo - referral access"
                className="logo"
                width="36"
                height="36"
                loading="lazy"
              />

              {/* <span className="initials" aria-hidden="true">Ar</span> */}
            </div>
            <div className="rule" />
          </header>

          <main className="container auth-content" role="main">
            <section className="hero">
              <h1 className="title">We're not open yet</h1>
              <p className="subtitle">
                {wakeUpError
                  ? "Server connection failed. Using offline mode."
                  : "Enter a Referral Code for exclusive access."}
              </p>

              <form onSubmit={handlePasswordSubmit} className="form" noValidate>
                <div className="field">
                  <input
                    aria-label="Referral Code"
                    name="code"
                    type="password"
                    autoComplete="off"
                    value={password} // Fixed: was using undefined 'code' variable
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                      if (success) setSuccess("");
                    }}
                    className={`input ${error ? "input-error" : ""}`}
                  />
                  {error && (
                    <p className="error-text" role="alert">
                      {error}
                    </p>
                  )}
                  {success && (
                    <p className="success-text" role="status">
                      {success}
                    </p>
                  )}
                </div>

                <button type="submit" className="btn-cta" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="button-spinner"></span>
                      Verifying...
                    </>
                  ) : (
                    "Let's Play"
                  )}
                </button>
              </form>
            </section>
          </main>

          <div className="landscape-overlay" aria-hidden="true">
            <p>Please rotate your device to portrait</p>
          </div>
        </>
      )}

      {/* Floating Pills */}
      {floatingPills.map((pill) => (
        <div
          key={pill.id}
          className="floating-pill"
          style={{
            left: `${pill.x}px`,
            top: `${pill.y}px`,
          }}
        >
          عبالك سويت شي؟
        </div>
      ))}

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

        .loading-content p {
          margin: 0.5rem 0 2rem 0;
          color: #666;
          font-size: 1rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
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

        .floating-pill {
          position: fixed;
          background: #1e1e1e;
          color: white;
          padding: 12px 20px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.98rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          z-index: 1000;
          pointer-events: none;
          animation: floatDown 4s ease-in forwards;
          opacity: 0.9;
          border: 2px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
        }

        @keyframes floatDown {
          0% {
            transform: translateY(-50px) rotate(-5deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(${window.innerHeight + 100}px) rotate(5deg);
            opacity: 0;
          }
        }

        .hamburger:hover {
          transform: scale(1.1);
          transition: transform 0.2s ease;
        }

        .hamburger:active {
          transform: scale(0.95);
        }

        .button-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid #fff;
          border-radius: 50%;
          border-top-color: transparent;
          animation: button-spin 1s ease-in-out infinite;
          margin-right: 8px;
        }

        @keyframes button-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .btn-cta:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
