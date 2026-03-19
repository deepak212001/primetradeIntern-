import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Middleware to restrict access to admin users only.
 * Must be used after authMiddleware.
 */
const adminMiddleware = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new ApiError(403, "Access denied. Admin privileges required."));
  }
  next();
});

export default adminMiddleware;
