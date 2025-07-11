import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AuthCallback() {
  const { setToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = () => {
      // Get token and provider from URL query parameters
      const query = new URLSearchParams(location.search);
      const token = query.get('token');
      const provider = query.get('provider') || 'github';

      if (token) {
        // Set the token in auth context
        setToken(token, provider);
        
        // Navigate to repos page
        navigate('/repos');
      } else {
        setError('No authentication token received');
        // Redirect back to home after 3 seconds
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleCallback();
  }, [location, navigate, setToken]);

  if (error) {
    return (
      <div className="error">
        <h2>Authentication Error</h2>
        <p>{error}</p>
        <p>Redirecting to home page...</p>
      </div>
    );
  }

  return (
    <div className="loading">
      <p>Authenticating with GitHub...</p>
    </div>
  );
}

export default AuthCallback; 