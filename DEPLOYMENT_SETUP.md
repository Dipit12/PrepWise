# Deployment Setup Guide

This document outlines the environment variables and configuration needed for both frontend and backend deployment.

## Backend Setup (Render)

### Environment Variables
Create a `.env` file in the `server/` directory with the following variables:

```
# Database Connection
MONGO_URI=your_mongodb_connection_string

# JWT Secret (use a strong, random string)
JWT_SECRET=your_jwt_secret_key

# Port (optional, defaults to 3001)
PORT=3001

# Google Generative AI API Key
GOOGLE_GENAI_API_KEY=your_google_genai_api_key

# Node Environment
NODE_ENV=production
```

### Steps to Deploy on Render:
1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Set the build command: `npm install`
5. Set the start command: `node server.js`
6. Add the environment variables in Render dashboard under "Environment"
7. Deploy

### Important Notes:
- Cookies are configured with `secure: true` and `sameSite: "none"` for HTTPS cross-origin requests
- CORS is configured to allow any origin with credentials
- All protected routes require valid JWT token in cookies

---

## Frontend Setup (Vercel)

### Environment Variables
Create a `.env.local` file in the `client/` directory with the following variable:

```
# Backend API URL
VITE_API_URL=https://your-render-backend-url.onrender.com
```

For local development, you can use:
```
VITE_API_URL=http://localhost:3001
```

### Steps to Deploy on Vercel:
1. Connect your GitHub repository to Vercel
2. Select the `client/` folder as the root directory
3. Set environment variables in Vercel dashboard:
   - `VITE_API_URL` = your Render backend URL
4. Deploy

### Important Notes:
- The frontend uses Vite, so environment variables must be prefixed with `VITE_`
- Axios is configured to send credentials with all requests
- Request/response interceptors handle auth errors globally

---

## Local Development

### Backend:
```bash
cd server
npm install
# Create .env file with local values
npm run dev
```

### Frontend:
```bash
cd client
npm install
# Create .env.local file with VITE_API_URL=http://localhost:3001
npm run dev
```

---

## Security Considerations

✓ Helmet.js for security headers
✓ CORS properly configured for credentials
✓ JWT tokens stored in httpOnly cookies
✓ Tokens expire after 24 hours
✓ Logout blacklists tokens

## Troubleshooting

### "401 Unauthorized" Error:
- Ensure backend is returning cookies with `secure: true` and `sameSite: "none"`
- Check that frontend is sending `withCredentials: true`
- Verify environment variables are set correctly

### CORS Errors:
- Check that backend CORS allows the frontend origin
- Ensure cookies are configured correctly for cross-origin requests

### Cannot Connect to Database:
- Verify MONGO_URI is correct
- Check MongoDB connection string has proper IP whitelist
