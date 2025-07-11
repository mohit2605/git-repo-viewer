# GitHub & Jira Explorer

A full-stack application that allows users to log in with their GitHub or Jira account using OAuth2 and view all their repositories and projects.

## Project Structure

This is a monorepo with:
- `client/`: React frontend
- `server/`: Node.js backend with Express

## Prerequisites

- Node.js (v14+ recommended)
- npm or yarn
- GitHub account to create an OAuth App
- Atlassian account to create a Jira OAuth App

## Setup

### 1. Create a GitHub OAuth App

1. Go to your GitHub account settings: https://github.com/settings/developers
2. Click on "OAuth Apps" and then "New OAuth App"
3. Fill in the following details:
   - Application name: GitHub Repository Explorer (or any name you prefer)
   - Homepage URL: http://localhost:3000
   - Authorization callback URL: http://localhost:5000/auth/github/callback
4. Click "Register application"
5. You will receive a Client ID and you can generate a Client Secret

### 2. Create a Jira OAuth App

1. Go to the Atlassian Developer Console: https://developer.atlassian.com/console/myapps/
2. Click "Create App" and choose "OAuth 2.0 (3LO)"
3. Fill in the following details:
   - App Name: GitHub & Jira Explorer (or any name you prefer)
   - Redirect URL: http://localhost:5001/auth/jira/callback
4. Add the required OAuth scopes:
   - `read:jira-user`
   - `read:jira-work`
   - `read:project:jira`
   - `offline_access` (for refresh token, optional)
5. Save the app and note down the Client ID and Client Secret

### 3. Configure Environment Variables

1. Create a `.env` file in the `server` directory based on the `.env.example` file:
   ```
   PORT=5001
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   JIRA_CLIENT_ID=your_jira_client_id
   JIRA_CLIENT_SECRET=your_jira_client_secret
   CLIENT_URL=http://localhost:3000
   SERVER_URL=http://localhost:5001
   JWT_SECRET=your_jwt_secret_key
   ```
   Replace the placeholder values with your actual GitHub and Jira OAuth App credentials.

### 4. Install Dependencies

Run the following command in the root directory to install all dependencies:

```bash
npm run install:all
```

## Running the Application

Start both the client and server with a single command:

```bash
npm start
```

This will run:
- Frontend at http://localhost:3000
- Backend at http://localhost:5001

## Features

- OAuth2 authentication with GitHub and Jira
- Secure token handling with JWT
- View all your public and private GitHub repositories
- View all your Jira projects from your Atlassian site
- Repository details including name, description, visibility, and language
- Project details including name, key, type, and direct links to Jira
- Multi-select dropdown interface for both GitHub repos and Jira projects

## Security Notes

- Client secrets are stored only on the server side
- JWT is used for maintaining user sessions
- Access tokens are never exposed in the frontend code
- HTTPS should be used in production

## License

ISC 