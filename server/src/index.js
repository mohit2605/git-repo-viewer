require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const jwt = require('jsonwebtoken');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(session({
  secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure GitHub Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_URL || 'http://localhost:5000'}/auth/github/callback`
  },
  function(accessToken, refreshToken, profile, done) {
    // Store the accessToken to use for API calls
    return done(null, { 
      profile, 
      accessToken 
    });
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Routes
app.get('/', (req, res) => {
  res.send('GitHub & Jira OAuth API is running');
});

// GitHub OAuth routes
app.get('/auth/github', passport.authenticate('github', { scope: ['repo'] }));

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login-failed' }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: req.user.profile.id,
        username: req.user.profile.username,
        accessToken: req.user.accessToken 
      }, 
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '1h' }
    );
    
    // Redirect to client with token
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth-callback?token=${token}`);
  }
);

app.get('/login-failed', (req, res) => {
  res.status(401).json({ success: false, message: 'GitHub authentication failed' });
});

// Protected route to get repositories
app.get('/api/repos', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    
    // Use the GitHub access token to fetch repositories
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        'Authorization': `token ${decoded.accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching repositories:', error);
    res.status(500).json({ message: 'Error fetching repositories', error: error.message });
  }
});

// Jira OAuth2 routes
app.get('/auth/jira/login', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  req.session.jiraState = state;
  
  const authUrl = `https://auth.atlassian.com/authorize?` +
    `audience=api.atlassian.com&` +
    `client_id=${process.env.JIRA_CLIENT_ID}&` +
    `scope=read:jira-user read:jira-work read:project:jira offline_access&` +
    `redirect_uri=${process.env.SERVER_URL || 'http://localhost:5001'}/auth/jira/callback&` +
    `state=${state}&` +
    `response_type=code&` +
    `prompt=consent`;
  
  res.redirect(authUrl);
});

app.get('/auth/jira/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login-failed`);
    }
    
    if (state !== req.session.jiraState) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login-failed`);
    }
    
    // Exchange code for access token
    const tokenResponse = await axios.post('https://auth.atlassian.com/oauth/token', {
      grant_type: 'authorization_code',
      client_id: process.env.JIRA_CLIENT_ID,
      client_secret: process.env.JIRA_CLIENT_SECRET,
      code: code,
      redirect_uri: `${process.env.SERVER_URL || 'http://localhost:5001'}/auth/jira/callback`
    });
    
    const { access_token, refresh_token } = tokenResponse.data;
    
    // Get accessible resources (sites)
    const resourcesResponse = await axios.get('https://api.atlassian.com/oauth/token/accessible-resources', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/json'
      }
    });
    
    const sites = resourcesResponse.data;
    const primarySite = sites[0]; // Use the first site
    
    if (!primarySite) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login-failed`);
    }
    
    // Generate JWT token with Jira info
    const token = jwt.sign(
      { 
        provider: 'jira',
        siteId: primarySite.id,
        siteName: primarySite.name,
        siteUrl: primarySite.url,
        accessToken: access_token,
        refreshToken: refresh_token
      }, 
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '1h' }
    );
    
    // Redirect to client with token
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth-callback?token=${token}&provider=jira`);
  } catch (error) {
    console.error('Jira OAuth error:', error);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login-failed`);
  }
});

// Protected route to get Jira projects
app.get('/api/jira/projects', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    
    if (decoded.provider !== 'jira') {
      return res.status(401).json({ message: 'Invalid token for Jira API' });
    }
    
    // Fetch Jira projects
    const response = await axios.get(`https://api.atlassian.com/ex/jira/${decoded.siteId}/rest/api/3/project/search`, {
      headers: {
        'Authorization': `Bearer ${decoded.accessToken}`,
        'Accept': 'application/json'
      }
    });
    
    res.json({
      projects: response.data.values,
      site: {
        id: decoded.siteId,
        name: decoded.siteName,
        url: decoded.siteUrl
      }
    });
  } catch (error) {
    console.error('Error fetching Jira projects:', error);
    res.status(500).json({ message: 'Error fetching Jira projects', error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 