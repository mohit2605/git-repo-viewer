import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { user, jiraUser, login, loginJira, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to repos page if already logged in
  React.useEffect(() => {
    if ((user || jiraUser) && !loading) {
      navigate('/repos');
    }
  }, [user, jiraUser, loading, navigate]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <div className="header">
        <h1>GitHub Repository Explorer</h1>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <h2>Welcome to GitHub & Jira Explorer</h2>
        <p>Login with your GitHub or Jira account to see your repositories and projects</p>
        
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={login} className="login-button">
            <span style={{ marginRight: '8px' }}>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
              </svg>
            </span>
            Login with GitHub
          </button>
          
          <button onClick={loginJira} className="login-button jira-button">
            <span style={{ marginRight: '8px' }}>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.53 2c0 2.4 1.97 4.37 4.37 4.37h.63v.63c0 2.4 1.97 4.37 4.37 4.37V2H11.53zm-.63 9.37c0 2.4 1.97 4.37 4.37 4.37h.63v.63c0 2.4 1.97 4.37 4.37 4.37V11.37H10.9z"/>
                <path d="M2 11.9c2.4 0 4.37-1.97 4.37-4.37V7.9h.63c2.4 0 4.37-1.97 4.37-4.37H2v8.37zm9.37.63c2.4 0 4.37-1.97 4.37-4.37v-.63h.63c2.4 0 4.37-1.97 4.37-4.37v8.37H11.37z"/>
              </svg>
            </span>
            Login with Jira
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home; 