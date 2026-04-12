# Quick Start Guide

## Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Google Generative AI API key

## Installation & Setup

### 1. Backend Setup

```bash
cd server

# Install dependencies (includes new helmet package)
npm install

# Create .env file
cat > .env << 'ENVEOF'
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_here
GOOGLE_GENAI_API_KEY=your_google_api_key_here
NODE_ENV=development
ENVEOF

# Start development server
npm run dev
```

The backend will be available at `http://localhost:3001`

### 2. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << 'ENVEOF'
VITE_API_URL=http://localhost:3001
ENVEOF

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Production Deployment

### Deploy Backend to Render:
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect your repository
4. Set start command: `node server.js`
5. Add environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `GOOGLE_GENAI_API_KEY`
   - `NODE_ENV=production`

### Deploy Frontend to Vercel:
1. Push code to GitHub
2. Import project on Vercel
3. Set root directory: `client`
4. Add environment variable:
   - `VITE_API_URL` = your Render backend URL

## Key Changes Made

✅ Fixed CORS for cross-origin credentialed requests
✅ Added Helmet.js for security headers
✅ Environment variables for backend URL (no hardcoding)
✅ Global error handling middleware
✅ Request/response interceptors for auth errors
✅ Input validation on auth endpoints
✅ Cookie configuration for HTTPS and cross-origin requests

## Support

See `DEPLOYMENT_SETUP.md` for detailed configuration information.
