import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";
import { getDashboardStats, getAllUsers } from "../controllers/admin.controller.js";

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/dashboard", getDashboardStats);
router.get("/users", getAllUsers);

export default router;
