import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {registerSchema, loginSchema} from "../validators/auth.validator.js";

const registerUser = asyncHandler(async (req, res, next) => {
  const validatedData = registerSchema.parse(req.body);
  const {name, email, password} = validatedData;
  const existingUser = await User.findOne({email});
  if (existingUser) {
    return next(new ApiError(400, "User already exists"));
  }
  const user = await User.create({name, email, password});
  const token = user.generateToken();
  const refreshTokenValue = user.generateRefreshToken();
  const userResponse = user.toObject();
  delete userResponse.password;

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
  res.cookie("refreshToken", refreshTokenValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 7,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
  res
    .status(201)
    .json(
      new ApiResponse(201, { user: userResponse, token }, "User registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res, next) => {
  console.log("[LOGIN API] Request body:", req.body);
  const validatedData = loginSchema.parse(req.body);
  const {email, password} = validatedData;

  // Case-insensitive email search (DB may have Admin@admin.com or admin@admin.com)
  const user = await User.findOne({ email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } });
  console.log("[LOGIN API] User found:", user?.email ?? "null");
  if (!user) {
    return next(new ApiError(401, "Invalid credentials"));
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    return next(new ApiError(401, "Invalid credentials"));
  }
  const token = user.generateToken();
  const userResponse = user.toObject();
  delete userResponse.password;

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
  res.cookie("refreshToken", user.generateRefreshToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 7,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, { user: userResponse, token }, "User logged in successfully")
    );
});

const logoutUser = asyncHandler(async (req, res, next) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
  res
    .status(200)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const getMe = asyncHandler(async (req, res, next) => {
  const user = req.user.toObject();
  delete user.password;
  res
    .status(200)
    .json(new ApiResponse(200, { user }, "User fetched successfully"));
});

const refreshToken = asyncHandler(async (req, res, next) => {
  const refreshTokenValue =
    req.cookies.refreshToken || req.body?.refreshToken || req.headers["x-refresh-token"];
  if (!refreshTokenValue) {
    return next(new ApiError(401, "Refresh token required"));
  }
  const secret =
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || process.env.TOKEN_SECRET;
  const decoded = jwt.verify(refreshTokenValue, secret);
  const user = await User.findById(decoded._id);
  if (!user) {
    return next(new ApiError(401, "Invalid refresh token"));
  }
  const token = user.generateToken();
  const userResponse = user.toObject();
  delete userResponse.password;

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
  res
    .status(200)
    .json(new ApiResponse(200, { user: userResponse }, "Token refreshed successfully"));
});

export { registerUser, loginUser, logoutUser, getMe, refreshToken };
