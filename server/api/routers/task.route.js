import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/task.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createTask);
router.get("/", getTasks);
router.get("/:id", getTaskById);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
