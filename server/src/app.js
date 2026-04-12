import express from "express";
import helmet from "helmet";
import authRouter from "./routes/authRoutes.js";
import interviewRouter from "./routes/interviewRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration for credentialed requests
const corsOptions = {
  origin: true, // Allow any origin
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ msg: "Server is healthy" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ msg: "Route not found" });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // Default error response
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    msg: message,
    error: process.env.NODE_ENV === "development" ? err : undefined,
  });
});

export default app;
