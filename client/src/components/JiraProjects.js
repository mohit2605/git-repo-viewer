import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

function JiraProjects() {
  const { user, jiraUser, fetchJiraProjects } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [siteInfo, setSiteInfo] = useState(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await fetchJiraProjects();
        setProjects(data.projects || []);
        setSiteInfo(data.site);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch Jira projects');
        setLoading(false);
      }
    };

    if (jiraUser) {
      loadProjects();
    }
  }, [jiraUser, fetchJiraProjects]);

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

  const handleProjectSelection = (projectId) => {
    setSelectedProjectIds(prevSelected => {
      if (prevSelected.includes(projectId)) {
        return prevSelected.filter(id => id !== projectId);
      } else {
        return [...prevSelected, projectId];
      }
    });
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const getSelectedProjects = () => {
    return projects.filter(project => selectedProjectIds.includes(project.id));
  };

  const handleSelectAll = () => {
    setSelectedProjectIds(projects.map(project => project.id));
  };

  const handleDeselectAll = () => {
    setSelectedProjectIds([]);
  };

  if (loading) {
    return <div className="loading">Loading Jira projects...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      {jiraUser && !user && (
        <div className="integration-suggestion">
          <p>💡 <strong>Tip:</strong> Connect your GitHub account to also view and manage your GitHub repositories alongside your Jira projects!</p>
        </div>
      )}
      
      <div className="jira-header">
        <h2>Jira Projects ({projects.length})</h2>
        {siteInfo && (
          <p className="site-info">
            Site: <strong>{siteInfo.name}</strong> ({siteInfo.url})
          </p>
        )}
      </div>
      
      {projects.length === 0 ? (
        <p>No Jira projects found.</p>
      ) : (
        <div>
          <div className="repo-selector">
            <h3>Select Jira Projects to View:</h3>
            <div className="dropdown-container">
              <div className="custom-dropdown">
                <button 
                  className="dropdown-toggle"
                  onClick={toggleDropdown}
                  type="button"
                >
                  <span>
                    {selectedProjectIds.length === 0 
                      ? 'Select projects...' 
                      : `${selectedProjectIds.length} projects selected`
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
                      {projects.map(project => (
                        <label key={project.id} className="dropdown-item">
                          <input
                            type="checkbox"
                            checked={selectedProjectIds.includes(project.id)}
                            onChange={() => handleProjectSelection(project.id)}
                          />
                          <span className="checkbox-custom"></span>
                          <span className="repo-info">
                            <span className="repo-name-dropdown">{project.name}</span>
                            <span className="project-key-badge">
                              {project.key}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {selectedProjectIds.length > 0 && (
              <div className="selected-repos-info">
                <p>Selected projects: {selectedProjectIds.length}</p>
                <button 
                  className="clear-selection-btn"
                  onClick={() => setSelectedProjectIds([])}
                >
                  Clear All Selections
                </button>
              </div>
            )}
          </div>

          {getSelectedProjects().length > 0 && (
            <div>
              <h3>Selected Projects ({getSelectedProjects().length})</h3>
              <div className="repo-list">
                {getSelectedProjects().map(project => (
                  <div key={project.id} className="repo-card">
                    <div className="repo-card-header">
                      <h3 className="repo-name">{project.name}</h3>
                      <button 
                        className="remove-repo-btn"
                        onClick={() => handleProjectSelection(project.id)}
                        title="Remove from selection"
                      >
                        ×
                      </button>
                    </div>
                    <p className="repo-description">
                      {project.description || 'No description available'}
                    </p>
                    <div>
                      <span className="project-key-badge">
                        Key: {project.key}
                      </span>
                      <span className="project-type-badge">
                        {project.projectTypeKey}
                      </span>
                    </div>
                    <a 
                      href={`${siteInfo?.url}/browse/${project.key}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="repo-link"
                    >
                      View in Jira
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

export default JiraProjects; 