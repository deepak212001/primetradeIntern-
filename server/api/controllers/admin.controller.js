import User from "../models/user.model.js";
import Task from "../models/task.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getDashboardStats = asyncHandler(async (req, res) => {
  const [userCount, taskCount, completedTaskCount] = await Promise.all([
    User.countDocuments(),
    Task.countDocuments(),
    Task.countDocuments({ status: "completed" }),
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
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.status(200).json(
    new ApiResponse(200, { users }, "Users fetched successfully")
  );
});

export { getDashboardStats, getAllUsers };
