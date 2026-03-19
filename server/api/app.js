import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import userRouter from "./routers/user.route.js";
import taskRouter from "./routers/task.route.js";
import adminRouter from "./routers/admin.route.js";
import errorHandler from "./middlewares/errorHandler.middleware.js";


const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "https://myraid-task-rqz5.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true,
  })
);

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(cookieParser());

// Note: express-mongo-sanitize removed - incompatible with Express 5 (req.query is read-only).
// Zod validation + controlled query structure provides sufficient protection.

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});
app.use("/api/", limiter);

// API v1 routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/admin", adminRouter);


// Health check
app.get("/", (req, res) => {
  res.json({ message: "Task Management API - Server is running!", version: "1.0" });
});

// Global error handler (must be last)
app.use(errorHandler);

export { app };
