import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is authenticated on initial load
    const token = localStorage.getItem('github_token');
    if (token) {
      try {
        // Decode JWT token to get user info
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        setUser({
          id: payload.id,
          username: payload.username,
          token
        });
      } catch (err) {
        console.error('Error decoding token:', err);
        localStorage.removeItem('github_token');
      }
    }
    setLoading(false);
  }, []);

  const login = () => {
    window.location.href = 'http://localhost:5001/auth/github';
  };

  const logout = () => {
    localStorage.removeItem('github_token');
    setUser(null);
  };

  const setToken = (token) => {
    if (token) {
      localStorage.setItem('github_token', token);
      try {
        // Decode JWT token to get user info
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        setUser({
          id: payload.id,
          username: payload.username,
          token
        });
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

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    setToken,
    fetchRepos
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 