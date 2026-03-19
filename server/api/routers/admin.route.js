import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";
import {
  getDashboardStats,
  getAllUsers,
  loginAdmin,
  adminCreate,
  logoutAdmin,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.post("/create", adminCreate);

router.get("/dashboard", authMiddleware, adminMiddleware, getDashboardStats);
router.get("/users", authMiddleware, adminMiddleware, getAllUsers);
router.post("/logout", authMiddleware, adminMiddleware, logoutAdmin);

export default router;
