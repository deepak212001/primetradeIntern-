import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  refreshToken,
} from "../controllers/user.controller.js";

const router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);
router.get("/me", authMiddleware, getMe);
router.post("/logout", authMiddleware, logoutUser);

export default router;
