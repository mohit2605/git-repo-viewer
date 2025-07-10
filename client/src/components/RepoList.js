import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RepoList() {
  const { user, logout, fetchRepos, error: authError } = useAuth();
  const [repos, setRepos] = useState([]);
  const [selectedRepoIds, setSelectedRepoIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadRepos = async () => {
      try {
        const repoData = await fetchRepos();
        setRepos(repoData);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch repositories');
        setLoading(false);
      }
    };

    if (user) {
      loadRepos();
    } else {
      navigate('/');
    }
  }, [user, fetchRepos, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.custom-dropdown')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRepoSelection = (repoId) => {
    setSelectedRepoIds(prevSelected => {
      if (prevSelected.includes(repoId)) {
        return prevSelected.filter(id => id !== repoId);
      } else {
        return [...prevSelected, repoId];
      }
    });
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const getSelectedRepos = () => {
    return repos.filter(repo => selectedRepoIds.includes(repo.id));
  };

  const handleSelectAll = () => {
    setSelectedRepoIds(repos.map(repo => repo.id));
  };

  const handleDeselectAll = () => {
    setSelectedRepoIds([]);
  };

  if (loading) {
    return <div className="loading">Loading repositories...</div>;
  }

  if (error || authError) {
    return (
      <div>
        <div className="header">
          <h1>GitHub Repository Explorer</h1>
          <button onClick={handleLogout} className="login-button">Logout</button>
        </div>
        <div className="error">
          <h2>Error</h2>
          <p>{error || authError}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="header">
        <h1>GitHub Repository Explorer</h1>
        <div>
          <span style={{ marginRight: '15px' }}>Logged in as <strong>{user.username}</strong></span>
          <button onClick={handleLogout} className="login-button">Logout</button>
        </div>
      </div>

      <h2>Your Repositories ({repos.length})</h2>
      
      {repos.length === 0 ? (
        <p>No repositories found.</p>
      ) : (
        <div>
          <div className="repo-selector">
            <h3>Select Repositories to View:</h3>
            <div className="dropdown-container">
              <div className="custom-dropdown">
                <button 
                  className="dropdown-toggle"
                  onClick={toggleDropdown}
                  type="button"
                >
                  <span>
                    {selectedRepoIds.length === 0 
                      ? 'Select repositories...' 
                      : `${selectedRepoIds.length} repositories selected`
                    }
                  </span>
                  <span className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`}>
                    ▼
                  </span>
                </button>
                
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <button 
                        className="select-all-btn"
                        onClick={handleSelectAll}
                        type="button"
                      >
                        Select All
                      </button>
                      <button 
                        className="deselect-all-btn"
                        onClick={handleDeselectAll}
                        type="button"
                      >
                        Deselect All
                      </button>
                    </div>
                    
                    <div className="dropdown-items">
                      {repos.map(repo => (
                        <label key={repo.id} className="dropdown-item">
                          <input
                            type="checkbox"
                            checked={selectedRepoIds.includes(repo.id)}
                            onChange={() => handleRepoSelection(repo.id)}
                          />
                          <span className="checkbox-custom"></span>
                          <span className="repo-info">
                            <span className="repo-name-dropdown">{repo.name}</span>
                            <span className={`repo-visibility-badge ${repo.private ? 'private' : 'public'}`}>
                              {repo.private ? 'Private' : 'Public'}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {selectedRepoIds.length > 0 && (
              <div className="selected-repos-info">
                <p>Selected repositories: {selectedRepoIds.length}</p>
                <button 
                  className="clear-selection-btn"
                  onClick={() => setSelectedRepoIds([])}
                >
                  Clear All Selections
                </button>
              </div>
            )}
          </div>

          {getSelectedRepos().length > 0 && (
            <div>
              <h3>Selected Repositories ({getSelectedRepos().length})</h3>
              <div className="repo-list">
                {getSelectedRepos().map(repo => (
                  <div key={repo.id} className="repo-card">
                    <div className="repo-card-header">
                      <h3 className="repo-name">{repo.name}</h3>
                      <button 
                        className="remove-repo-btn"
                        onClick={() => handleRepoSelection(repo.id)}
                        title="Remove from selection"
                      >
                        ×
                      </button>
                    </div>
                    <p className="repo-description">
                      {repo.description || 'No description available'}
                    </p>
                    <div>
                      <span className={`repo-visibility ${repo.private ? 'private' : 'public'}`}>
                        {repo.private ? 'Private' : 'Public'}
                      </span>
                      {repo.language && (
                        <span style={{ fontSize: '14px', color: '#586069', marginLeft: '8px' }}>
                          {repo.language}
                        </span>
                      )}
                    </div>
                    <a 
                      href={repo.html_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="repo-link"
                    >
                      View on GitHub
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RepoList; 