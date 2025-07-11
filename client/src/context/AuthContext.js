import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [jiraUser, setJiraUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is authenticated on initial load
    const githubToken = localStorage.getItem('github_token');
    const jiraToken = localStorage.getItem('jira_token');
    
    if (githubToken) {
      try {
        // Decode JWT token to get user info
        const base64Url = githubToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        setUser({
          id: payload.id,
          username: payload.username,
          token: githubToken
        });
      } catch (err) {
        console.error('Error decoding GitHub token:', err);
        localStorage.removeItem('github_token');
      }
    }
    
    if (jiraToken) {
      try {
        // Decode JWT token to get Jira user info
        const base64Url = jiraToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        setJiraUser({
          provider: payload.provider,
          siteId: payload.siteId,
          siteName: payload.siteName,
          siteUrl: payload.siteUrl,
          token: jiraToken
        });
      } catch (err) {
        console.error('Error decoding Jira token:', err);
        localStorage.removeItem('jira_token');
      }
    }
    
    setLoading(false);
  }, []);

  const login = () => {
    window.location.href = 'http://localhost:5001/auth/github';
  };

  const loginJira = () => {
    window.location.href = 'http://localhost:5001/auth/jira/login';
  };

  const logout = () => {
    localStorage.removeItem('github_token');
    setUser(null);
  };

  const logoutJira = () => {
    localStorage.removeItem('jira_token');
    setJiraUser(null);
  };

  const setToken = (token, provider = 'github') => {
    if (token) {
      try {
        // Decode JWT token to get user info
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        if (provider === 'jira') {
          localStorage.setItem('jira_token', token);
          setJiraUser({
            provider: payload.provider,
            siteId: payload.siteId,
            siteName: payload.siteName,
            siteUrl: payload.siteUrl,
            token
          });
        } else {
          localStorage.setItem('github_token', token);
          setUser({
            id: payload.id,
            username: payload.username,
            token
          });
        }
      } catch (err) {
        console.error('Error decoding token:', err);
        setError('Invalid authentication token');
      }
    }
  };

  const fetchRepos = async () => {
    try {
      if (!user || !user.token) {
        throw new Error('User not authenticated');
      }

      const response = await axios.get('http://localhost:5001/api/repos', {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      return response.data;
    } catch (err) {
      console.error('Error fetching repos:', err);
      setError(err.response?.data?.message || err.message || 'Error fetching repositories');
      throw err;
    }
  };

  const fetchJiraProjects = async () => {
    try {
      if (!jiraUser || !jiraUser.token) {
        throw new Error('Jira user not authenticated');
      }

      const response = await axios.get('http://localhost:5001/api/jira/projects', {
        headers: {
          Authorization: `Bearer ${jiraUser.token}`
        }
      });

      return response.data;
    } catch (err) {
      console.error('Error fetching Jira projects:', err);
      setError(err.response?.data?.message || err.message || 'Error fetching Jira projects');
      throw err;
    }
  };

  const value = {
    user,
    jiraUser,
    loading,
    error,
    login,
    loginJira,
    logout,
    logoutJira,
    setToken,
    fetchRepos,
    fetchJiraProjects
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 