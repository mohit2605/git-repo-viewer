import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import AuthCallback from './components/AuthCallback';
import RepoList from './components/RepoList';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth-callback" element={<AuthCallback />} />
            <Route 
              path="/repos" 
              element={
                <PrivateRoute>
                  <RepoList />
                </PrivateRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

// PrivateRoute component to protect routes that require authentication
function PrivateRoute({ children }) {
  const githubToken = localStorage.getItem('github_token');
  const jiraToken = localStorage.getItem('jira_token');
  
  if (!githubToken && !jiraToken) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

export default App; 