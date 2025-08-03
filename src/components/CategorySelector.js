import React, { useState, useMemo, useEffect } from 'react';
import Lottie from 'lottie-react';
import './CategorySelector.css';
import fireAnimation from '../assets/fire.json';

function CategorySelector({ selectedCategories, onCategoryChange, onTeamNamesChange, teamNames }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [step, setStep] = useState('categories'); // 'categories', 'teams', 'summary'
  const [localTeamNames, setLocalTeamNames] = useState({ team1: '', team2: '' });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories from API on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/categories');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.categories) {
          // Map database format to component format
          const mappedCategories = data.categories
            .filter(cat => cat.is_active) // Only show active categories
            .map(cat => ({
              id: cat.id.toString(), // Convert to string for consistency
              name: cat.title,
              image: cat.images || '/images/default.jpg' // Use default image if none provided
            }));
          
          setCategories(mappedCategories);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    return categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, categories]);

  const handleCategoryClick = (category) => {
    const isSelected = selectedCategories.some(c => c.id === category.id);
    
    if (isSelected) {
      // Remove category
      const newSelected = selectedCategories.filter(c => c.id !== category.id);
      onCategoryChange(newSelected);
    } else if (selectedCategories.length < 5) {
      // Add category (only if less than 5)
      onCategoryChange([...selectedCategories, category]);
    }
  };

  const isDisabled = (category) => {
    const isSelected = selectedCategories.some(c => c.id === category.id);
    return !isSelected && selectedCategories.length >= 5;
  };

  const isSelected = (category) => {
    return selectedCategories.some(c => c.id === category.id);
  };

  const handleNextToTeams = () => {
    setStep('teams');
  };

  const handleTeamNamesNext = () => {
    if (localTeamNames.team1.trim() && localTeamNames.team2.trim()) {
      onTeamNamesChange(localTeamNames);
      setStep('summary');
    }
  };

  const handleBackToCategories = () => {
    setStep('categories');
  };

  const handleBackToTeams = () => {
    setStep('teams');
  };

  // Step 1: Category Selection
  if (step === 'categories') {
    return (
      <div className="category-selector">
        <div className="category-header-start">
          <h3>
            {selectedCategories.length === 5 
              ? "Ready to go! 🎉" 
              : selectedCategories.length === 0 
                ? "Choose 5 Categories" 
                : `Choose ${5 - selectedCategories.length} More Categor${5 - selectedCategories.length === 1 ? 'y' : 'ies'}`
            }
          </h3>
          {selectedCategories.length === 5 && (
            <button className="next-btn" onClick={handleNextToTeams}>
              Next
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <p>Loading categories...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-state">
            <p>Error loading categories: {error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}

        {/* Normal Category Selection */}
        {!loading && !error && (
          <>
            {/* Search Bar */}
            <div className="search-container">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Selected Categories Display */}
            {selectedCategories.length > 0 && (
              <div className="selected-categories">
                <div className="selected-list">
                  {selectedCategories.map((category) => (
                    <div key={category.id} className="selected-tag">
                      <span>{category.name}</span>
                      <button 
                        onClick={() => handleCategoryClick(category)}
                        className="remove-btn"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categories Grid */}
            <div className="categories-container">
              <div className="categories-scroll">
                {filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className={`category-card ${isSelected(category) ? 'selected' : ''} ${isDisabled(category) ? 'disabled' : ''}`}
                    onClick={() => !isDisabled(category) && handleCategoryClick(category)}
                  >
                    <div className="category-image">
                      <img 
                        src={category.image} 
                        alt={category.name}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZjA0ZjMwIiBvcGFjaXR5PSIwLjIiLz4KPHN2ZyB4PSIzNSIgeT0iMzUiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmMDRmMzAiIHN0cm9rZS13aWR0aD0iMiI+CjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIi8+CjxjaXJjbGUgY3g9Ijg5IiBjeT0iOSIgcj0iMiIvPgo8cGF0aCBkPSJtOSAyMS0xLjUtMS41TDEyIDEyIi8+Cjwvc3ZnPgo8L3N2Zz4K';
                        }}
                      />
                      {isSelected(category) && (
                        <div className="selected-overlay">
                          <div className="checkmark">✓</div>
                        </div>
                      )}
                    </div>
                    <div className="category-name">{category.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {filteredCategories.length === 0 && !loading && (
              <div className="no-results">
                <p>No categories found for "{searchTerm}"</p>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // Step 2: Team Names
  if (step === 'teams') {
    return (
      <div className="category-selector">
        <div className="category-header-start">
          <h3>Enter Team Names</h3>
          <button className="back-btn" onClick={handleBackToCategories}>
            Back
          </button>
        </div>

        {/* Selected Categories Display */}
        <div className="selected-categories">
          <div className="selected-list">
            {selectedCategories.map((category) => (
              <div key={category.id} className="selected-tag">
                <span>{category.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Team Name Inputs */}
        <div className="team-names-container">
          <div className="team-input-group">
            <label htmlFor="team1">Team 1 Name</label>
            <input
              id="team1"
              type="text"
              placeholder="Enter team 1 name..."
              value={localTeamNames.team1}
              onChange={(e) => setLocalTeamNames(prev => ({ ...prev, team1: e.target.value }))}
              className="team-input"
            />
          </div>
          <div className="team-input-group">
            <label htmlFor="team2">Team 2 Name</label>
            <input
              id="team2"
              type="text"
              placeholder="Enter team 2 name..."
              value={localTeamNames.team2}
              onChange={(e) => setLocalTeamNames(prev => ({ ...prev, team2: e.target.value }))}
              className="team-input"
            />
          </div>
          <button 
            className="next-btn full-width" 
            onClick={handleTeamNamesNext}
            disabled={!localTeamNames.team1.trim() || !localTeamNames.team2.trim()}
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Summary (minimal display)
  if (step === 'summary') {
    return (
      <div className="game-summary">
        <div className="summary-header">
          <button className="edit-btn" onClick={handleBackToTeams}>
            Edit
          </button>
        </div>
        <div className="summary-content">
          <div className="summary-section">
            <div className="summary-tags">
              {selectedCategories.map((category, index) => (
                <span 
                  key={category.id} 
                  className="summary-tag"
                  style={{ '--animation-order': index }}
                >
                  {category.name}
                </span>
              ))}
            </div>
          </div>
          <div className="summary-section">
            <div className="summary-teams">
              <span className="team-name">{teamNames?.team1 || localTeamNames.team1}</span>
              <div className="vs-container">
                <Lottie 
                  animationData={fireAnimation} 
                  className="fire-animation"
                  loop={true}
                  autoplay={true}
                />
              </div>
              <span className="team-name">{teamNames?.team2 || localTeamNames.team2}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default CategorySelector;
