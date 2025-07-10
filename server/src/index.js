require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const jwt = require('jsonwebtoken');
const axios = require('axios');

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
  res.send('GitHub OAuth API is running');
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 