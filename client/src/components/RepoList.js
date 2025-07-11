import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import JiraProjects from './JiraProjects';

function RepoList() {
  const { user, jiraUser, logout, logoutJira, loginJira, fetchRepos, error: authError } = useAuth();
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
    } else if (!jiraUser) {
      navigate('/');
    } else {
      setLoading(false);
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
    logoutJira();
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
        <h1>GitHub & Jira Explorer</h1>
        <div className="header-actions">
          <div className="user-info">
            {user && (
              <span style={{ marginRight: '15px' }}>
                GitHub: <strong>{user.username}</strong>
              </span>
            )}
            {jiraUser && (
              <span style={{ marginRight: '15px' }}>
                Jira: <strong>{jiraUser.siteName}</strong>
              </span>
            )}
          </div>
          <div className="action-buttons">
            {user && !jiraUser && (
              <button onClick={loginJira} className="login-button jira-button" style={{ marginRight: '8px' }}>
                <span style={{ marginRight: '8px' }}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.53 2c0 2.4 1.97 4.37 4.37 4.37h.63v.63c0 2.4 1.97 4.37 4.37 4.37V2H11.53zm-.63 9.37c0 2.4 1.97 4.37 4.37 4.37h.63v.63c0 2.4 1.97 4.37 4.37 4.37V11.37H10.9z"/>
                    <path d="M2 11.9c2.4 0 4.37-1.97 4.37-4.37V7.9h.63c2.4 0 4.37-1.97 4.37-4.37H2v8.37zm9.37.63c2.4 0 4.37-1.97 4.37-4.37v-.63h.63c2.4 0 4.37-1.97 4.37-4.37v8.37H11.37z"/>
                  </svg>
                </span>
                Login with Jira
              </button>
            )}
            {jiraUser && !user && (
              <button onClick={() => window.location.href = 'http://localhost:5001/auth/github'} className="login-button" style={{ marginRight: '8px' }}>
                <span style={{ marginRight: '8px' }}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                  </svg>
                </span>
                Login with GitHub
              </button>
            )}
            <button onClick={handleLogout} className="login-button">Logout</button>
          </div>
        </div>
      </div>

      {user && !jiraUser && (
        <div className="integration-suggestion">
          <p>💡 <strong>Tip:</strong> Connect your Jira account to also view and manage your Jira projects alongside your GitHub repositories!</p>
        </div>
      )}

      {user && <h2>GitHub Repositories ({repos.length})</h2>}
      
      {user && repos.length === 0 ? (
        <p>No repositories found.</p>
      ) : user ? (
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
      ) : null}

      {jiraUser && <JiraProjects />}
    </div>
  );
}

export default RepoList; 