import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getUserProfile,
  getUserSettings,
  updateUserSettings,
  updateUserProfile,
  changePassword,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.get("/settings", protect, getUserSettings);
router.put("/settings", protect, updateUserSettings);
router.put("/password", protect, changePassword);

export default router;
