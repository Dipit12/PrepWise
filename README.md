# PrepWise

PrepWise is an AI-powered interview preparation platform that helps candidates:
- Generate personalized interview reports from job description + resume + self-description
- Review technical and behavioral interview questions
- Identify skill gaps with severity levels
- Follow a 7-day preparation roadmap
- Generate an updated resume in PDF format tailored to the target job

---

## Features

### 1) Authentication
- User registration and login (JWT + HTTP-only cookie auth)
- Protected routes in frontend
- Logout with token blacklist support on backend

### 2) Interview Report Generation
- Upload resume PDF + add job description + self description
- AI generates:
  - Match score
  - 5 technical questions
  - 5 behavioral questions
  - Skill gaps (`low`, `medium`, `high`)
  - 7-day preparation plan
- Report is persisted in MongoDB

### 3) Previous Report History
- Users can fetch all previous interview reports
- Open any specific report by ID
- Ownership-restricted report access

### 4) Updated Resume PDF Generation
- From an existing interview report, generate an updated role-tailored resume
- AI creates resume HTML
- Puppeteer converts HTML to downloadable PDF

### 5) Modern Frontend UX
- Public landing page (`/`)
- Auth pages (login/register)
- Protected workspace for report generation
- Interview report view with sections + history sidebar
- Navbar with user info and logout

---

## Tech Stack

### Frontend (`client`)
- React
- React Router
- SCSS
- Axios
- Vite

### Backend (`server`)
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Cookie parser + CORS
- Multer (file upload)
- `pdf-parse` (extract text from uploaded resume PDF)
- `@google/genai` (Gemini model integration)
- `zod` (schema validation)
- `puppeteer` (HTML to PDF for updated resume)

---

## Project Structure

```text
PrepWise/
  client/   # React frontend
  server/   # Express backend

Prerequisites

Make sure you have installed:
- Node.js (v18+ recommended)
- npm
- MongoDB Atlas (or local MongoDB)
- A valid Google GenAI API key

---

## Environment Variables

Create a `.env` file inside `server/`:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_GENAI_API_KEY=your_google_genai_api_key
```

> Do not commit `.env` files to version control.

---

## Install Dependencies

### 1) Backend
```bash
cd server
npm install
```

### 2) Frontend
```bash
cd client
npm install
```

---

## Run Locally

### Start backend
```bash
cd server
npm run dev
```

Backend runs on: `http://localhost:3000`

### Start frontend
```bash
cd client
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## Main Routes

### Frontend
- `/` → Public landing page
- `/login` → Login page
- `/register` → Register page
- `/workspace` → Protected report generation page
- `/workspace/interview-report` → Latest/current report view
- `/workspace/interview-report/:interviewID` → Specific report by ID

### Backend API

#### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/getMe`

#### Interview
- `POST /api/interview`  
  Uploads resume + JD + self description and generates report
- `GET /api/interview`  
  Fetch all reports for logged-in user
- `GET /api/interview/report/:interviewID`  
  Fetch one report by ID (owner only)
- `POST /api/interview/resume/pdf/:interviewReportID`  
  Generate + download updated resume PDF from report context

---

## How Resume Upload Works

1. Frontend sends multipart form data:
   - `title`
   - `jobDescription`
   - `selfDescription`
   - `resume` (PDF file)

2. Backend:
   - extracts PDF text using `pdf-parse`
   - calls Gemini to generate interview report JSON
   - validates response with Zod
   - stores report in MongoDB

---

## How Updated Resume PDF Works

1. Frontend calls:
   - `POST /api/interview/resume/pdf/:interviewReportID`
2. Backend:
   - loads report for the current authenticated user
   - prompts Gemini to generate resume HTML
   - validates JSON response
   - renders HTML via Puppeteer
   - returns downloadable PDF (`application/pdf`)

---

## Common Issues & Fixes

### 1) CORS error with credentials
Ensure backend CORS is configured with:
- `origin: "http://localhost:5173"`
- `credentials: true`

### 2) JWT secret error
If you see `secretOrPrivateKey must have a value`, verify `JWT_SECRET` is set in `server/.env`.

### 3) Resume PDF generation fails
- Ensure `GOOGLE_GENAI_API_KEY` is valid
- Ensure Puppeteer installed correctly (`npm install puppeteer`)
- Retry after server restart

### 4) Login/logout issues
- Backend logout route is `POST /api/auth/logout`
- Frontend must call it as POST (not GET)
- `withCredentials: true` should be enabled in Axios instance

---

## Scripts

### Backend (`server/package.json`)
- `npm run dev` → start server in watch mode

### Frontend (Vite defaults)
- `npm run dev` → start dev server
- `npm run build` → build production
- `npm run preview` → preview production build

---

## Security Notes

- Use strong `JWT_SECRET`
- Keep API keys private
- Use `httpOnly` cookies for auth token
- In production:
  - set secure cookie options (`secure: true`)
  - configure proper CORS origin(s)
  - run behind HTTPS

---

## Future Enhancements

- Toast notifications instead of `window.alert`
- Report filtering/search
- Saved generated resume versions
- Export interview report as PDF
- Analytics dashboard for improvement tracking

---

## Author

**Dipit Madan**  
Made with ❤️ by Dipit Madan
