import User from "../models/user.model.js";
import Task from "../models/task.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {ApiError} from "../utils/ApiError.js";
import {loginSchema} from "../validators/auth.validator.js";

const adminCreate = asyncHandler(async (req, res) => {
  const {name, email, password} = {
    name: "Admin",
    email: "admin@admin.com",
    password: "admin123",
  };
  const admin = await User.create({name, email, password, role: "admin"});
  res
    .status(201)
    .json(new ApiResponse(201, {admin}, "Admin created successfully"));
});

const loginAdmin = asyncHandler(async (req, res) => {
  const {email, password} = req.body;
  const admin = await User.findOne({email, role: "admin"});
  if (!admin) {
    return new ApiError(401, "Invalid credentials");
  }
  const isPasswordCorrect = await admin.comparePassword(password);
  if (!isPasswordCorrect) {
    return new ApiError(401, "Invalid credentials");
  }
  const token = admin.generateToken();
  res
    .status(200)
    .json(new ApiResponse(200, {token}, "Admin logged in successfully"));
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
  res.cookie("refreshToken", admin.generateRefreshToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 7,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
  res
    .status(200)
    .json(new ApiResponse(200, {token}, "Admin logged in successfully"));
});

const logoutAdmin = asyncHandler(async (req, res) => {
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
    .json(new ApiResponse(200, {}, "Admin logged out successfully"));
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const [userCount, taskCount, completedTaskCount] = await Promise.all([
    User.countDocuments(),
    Task.countDocuments(),
    Task.countDocuments({status: "completed"}),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalUsers: userCount,
        totalTasks: taskCount,
        completedTasks: completedTaskCount,
      },
      "Admin dashboard stats fetched successfully"
    )
  );
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort({createdAt: -1});
  res
    .status(200)
    .json(new ApiResponse(200, {users}, "Users fetched successfully"));
});

export {getDashboardStats, getAllUsers, loginAdmin, adminCreate, logoutAdmin};
