import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./GameSetup.css";
import fireAnimation from "../../assets/fire.json";
import Lottie from "lottie-react";
import peach from "../../assets/peach.png";

const GameSetup = ({ onGameStart }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [teamNames, setTeamNames] = useState({ team1: "", team2: "" });
  const [language, setLanguage] = useState("all"); // 'all' shows every category irrespective of language
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]); // Fixed variable naming
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log(categories);

  // console.log(selectedCategories, teamNames, language);

  // Fisher-Yates shuffle function
  function randomizeArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Random index between 0 and i
      [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap elements
    }
    return arr;
  }

  // Fetch categories from API on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const BACKEND_URL = "https://fiveo5a.onrender.com";
        const response = await fetch(`${BACKEND_URL}/categories`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.categories) {
          // Map database format to component format
          const mappedCategories = data.categories
            .filter((cat) => cat.is_active) // Only show active categories
            .map((cat) => ({
              id: cat.id.toString(), // Convert to string for consistency
              name: cat.title,
              image: cat.images || "/images/default.jpg",
              lang: cat.lang || "en",
            }));

            const randomizedCategories = randomizeArray(mappedCategories);

          setCategories(randomizedCategories);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError(err.message);
        // Fallback to mock data if API fails
        setCategories([
          { id: "1", name: "General Knowledge", image: null, lang: "en" },
          { id: "2", name: "Maths", image: null, lang: "en" },
          { id: "3", name: "Science", image: null, lang: "en" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        if (prev.length < 5) {
          return [...prev, categoryId];
        }
        return prev;
      }
    });
  };

  // Filter categories based on search term AND language (language 'all' bypasses lang filter)
  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesLanguage = language === "all" || category.lang === language;
    return matchesSearch && matchesLanguage;
  });

  const handleTeamNameChange = (team, value) => {
    setTeamNames((prev) => ({
      ...prev,
      [team]: value,
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      const gameData = {
        selectedCategories,
        teamNames,
      };

      // Call onGameStart if provided
      if (onGameStart) {
        onGameStart(gameData);
      } else {
        // Navigate to Game component
        navigate("/game", {
          state: {
            gameData,
          },
        });
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Step 1 - Choose Categories";
      case 2:
        return "Step 2 - Choose Teams";
      case 3:
        return "Step 3 - Shake Hands";
      default:
        return "";
    }
  };

  const getBottomText = () => {
    switch (currentStep) {
      case 1:
        return {
          main: selectedCategories.length === 5 ? "Perfect" : "Hmmm...",
          sub:
            selectedCategories.length === 5
              ? "Ready to proceed"
              : "Select 5 categories to continue",
        };
      case 2:
        return {
          main: "Teams",
          sub: "Choose your teams",
        };
      case 3:
        return {
          main: "Lets Go",
          sub: "If you lose you buy dinner",
        };
      default:
        return { main: "", sub: "" };
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedCategories.length === 5;
      case 2:
        return teamNames.team1.trim() !== "" && teamNames.team2.trim() !== "";
      case 3:
        return true;
      default:
        return false;
    }
  };

  const getButtonText = () => {
    if (currentStep === 1) {
      if (selectedCategories.length === 5) {
        return "Next";
      }
      return `${selectedCategories.length}/5`;
    } else if (currentStep === 3) {
      return "Play";
    } else {
      return "Next";
    }
  };

  const renderStep1 = () => (
    <div className="step-content">
      {loading && <div className="loading">Loading categories...</div>}
      {error && <div className="error">Error: {error}</div>}

      <div className="search-container">
        <input
          type="text"
          placeholder="Search"
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="language-selector">
        <button
          className={`language-btn ${language === "all" ? "active" : ""}`}
          onClick={() => {
            setLanguage("all");
            // (removed) setSelectedCategories([]);
          }}
        >
          All
        </button>
        <button
          className={`language-btn ${language === "en" ? "active" : ""}`}
          onClick={() => {
            setLanguage("en");
            // (removed) setSelectedCategories([]);
          }}
        >
          English
        </button>
        <button
          className={`language-btn ${language === "ar" ? "active" : ""}`}
          onClick={() => {
            setLanguage("ar");
            // (removed) setSelectedCategories([]);
          }}
        >
          Arabic
        </button>
      </div>

      <div className="categories-grid">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            const isDisabled = selectedCategories.length >= 5 && !isSelected;

            return (
              <div
                key={category.id}
                className={`category-card ${isSelected ? "selected" : ""} ${
                  isDisabled ? "disabled" : ""
                }`}
                onClick={() => !isDisabled && handleCategoryToggle(category.id)}
              >
                <div className="category-img-top">
                  {category.image &&
                  category.image !== "/images/default.jpg" ? (
                    <img src={category.image} alt={category.name} />
                  ) : (
                    <div className="category-placeholder"></div>
                  )}
                </div>
                <div className="category-body">
                  <div className="category-name">{category.name}</div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-results">
            <p>
              {loading
                ? "Loading..."
                : `No categories found ${
                    searchTerm
                      ? `matching "${searchTerm}"`
                      : "for selected language"
                  }`}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="step-content step2-content">
      <div className="team-input-container">
        <label htmlFor="team1" className="team-label">
          Team 1 Name
        </label>
        <input
          id="team1"
          type="text"
          value={teamNames.team1}
          onChange={(e) => handleTeamNameChange("team1", e.target.value)}
          className="team-input"
          placeholder="Enter team 1 name"
        />
      </div>

      <div className="team-input-container">
        <label htmlFor="team2" className="team-label">
          Team 2 Name
        </label>
        <input
          id="team2"
          type="text"
          value={teamNames.team2}
          onChange={(e) => handleTeamNameChange("team2", e.target.value)}
          className="team-input"
          placeholder="Enter team 2 name"
        />
      </div>
    </div>
  );

  const renderStep3 = () => {
    const selectedCategoryData = categories.filter((cat) =>
      selectedCategories.includes(cat.id)
    );

    return (
      <div className="step-content step3-content">
        <div className="selected-categories">
          {selectedCategoryData.map((category) => (
            <div key={category.id} className="selected-category-card">
              {category.name}
            </div>
          ))}
        </div>

        <div className="vs-section">
          <span className="team-name">{teamNames.team1}</span>
          <span className="vs-icon">
            <Lottie
              animationData={fireAnimation}
              className="fire-animation"
              loop={true}
              autoplay={true}
            />
          </span>
          <span className="team-name">{teamNames.team2}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="game-setup">
      <header className="setup-header">
        <div className="peach-icon">
          <img
            src={peach}
            alt="Peach logo - referral access"
            className="logo"
            width="36"
            height="36"
            loading="lazy"
          />
        </div>
      </header>

      <div className="setup-main">
        <h1 className="step-title">{getStepTitle()}</h1>

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>

      <div className="bottom-bar">
        <div className="bottom-content">
          <div className="bottom-text">
            <h3>{getBottomText().main}</h3>
          </div>
          <div className="action-buttons">
            {currentStep > 1 && (
              <button className="back-btn" onClick={handleBack}>
                Back
              </button>
            )}
            <button
              className={`next-btn ${!canProceed() ? "disabled" : ""}`}
              onClick={handleNext}
              disabled={!canProceed()}
            >
              {getButtonText()}
            </button>
          </div>
        </div>
      </div>

      <div className="landscape-overlay" aria-hidden="true">
        <p>Please rotate your device to portrait</p>
      </div>
    </div>
  );
};

export default GameSetup;
