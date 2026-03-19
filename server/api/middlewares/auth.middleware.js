import jwt from "jsonwebtoken";
import {ApiError} from "../utils/ApiError.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import User from "../models/user.model.js";

const authMiddleware = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.replace(/^Bearer\s+/i, "")?.trim();
    if (!token) {
      return next(new ApiError(401, "Unauthorized"));
    }
    const secret = process.env.JWT_SECRET || process.env.TOKEN_SECRET;
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded._id).select("-password");
    if (!user) {
      return next(new ApiError(401, "Unauthorized"));
    }
    req.user = user; // Full user object for role checks
    next();
  } catch {
    next(new ApiError(401, "Unauthorized"));
  }
});

export default authMiddleware;
