import Task from "../models/task.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
} from "../validators/task.validator.js";

const createTask = asyncHandler(async (req, res, next) => {
  const validated = createTaskSchema.parse(req.body);
  const task = await Task.create({
    ...validated,
    createdBy: req.user._id,
  });
  await task.populate("createdBy", "name email");
  res
    .status(201)
    .json(new ApiResponse(201, { task }, "Task created successfully"));
});

const getTasks = asyncHandler(async (req, res, next) => {
  const query = taskQuerySchema.parse(req.query);
  const { status, priority, page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = query;

  const filter = { createdBy: req.user._id };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const [tasks, total] = await Promise.all([
    Task.find(filter).sort(sort).skip(skip).limit(limit).populate("createdBy", "name email"),
    Task.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, "Tasks fetched successfully")
  );
});

const getTaskById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const task = await Task.findOne({ _id: id, createdBy: req.user._id }).populate(
    "createdBy",
    "name email"
  );
  if (!task) {
    return next(new ApiError(404, "Task not found"));
  }
  res.status(200).json(new ApiResponse(200, { task }, "Task fetched successfully"));
});

const updateTask = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const validated = updateTaskSchema.parse(req.body);

  const task = await Task.findOneAndUpdate(
    { _id: id, createdBy: req.user._id },
    { $set: validated },
    { new: true, runValidators: true }
  ).populate("createdBy", "name email");

  if (!task) {
    return next(new ApiError(404, "Task not found"));
  }
  res.status(200).json(new ApiResponse(200, { task }, "Task updated successfully"));
});

const deleteTask = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const task = await Task.findOneAndDelete({ _id: id, createdBy: req.user._id });
  if (!task) {
    return next(new ApiError(404, "Task not found"));
  }
  res.status(200).json(new ApiResponse(200, {}, "Task deleted successfully"));
});

export { createTask, getTasks, getTaskById, updateTask, deleteTask };
