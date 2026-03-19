import { ApiError } from "../utils/ApiError.js";
import { ZodError } from "zod";

/**
 * Global error handler middleware.
 * Handles ApiError, Zod validation errors, and unexpected errors.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let errors = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors || [];
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    errors = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid or expired token";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  } else if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    message = `${field} already exists`;
  } else if (err.message) {
    message = err.message;
  }

  if (process.env.NODE_ENV === "development" && statusCode === 500) {
    console.error("Error:", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
  });
};

export default errorHandler;
