import express from "express";
import authRouter from "./routes/authRoutes.js";
import interviewRouter from "./routes/interviewRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors());

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);
export default app;
