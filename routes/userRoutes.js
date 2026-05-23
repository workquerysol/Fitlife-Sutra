import express from "express"
import {
  loginUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getUserDashboard,
  getAllMembers,
  getMemberProfile,
} from "../controllers/userController.js"
import { protect, adminOnly } from "../middlewares/authMiddleware.js"

const router = express.Router()

router.post("/register", /* #swagger.tags = ['Users'] */ registerUser)
router.post("/login", /* #swagger.tags = ['Users'] */ loginUser)
router.post("/logout", /* #swagger.tags = ['Users'] */ logoutUser)
router.post("/forgot-password", /* #swagger.tags = ['Users'] */ forgotPassword)
router.post("/verify-otp", /* #swagger.tags = ['Users'] */ verifyOtp)
router.post("/reset-password/:token", /* #swagger.tags = ['Users'] */ resetPassword)
router
  .route("/profile")
  .get(protect, /* #swagger.tags = ['Users'] */ getUserProfile)
  .put(protect, /* #swagger.tags = ['Users'] */ updateUserProfile)

router.get("/dashboard", protect, /* #swagger.tags = ['Users'] */ getUserDashboard)

// Admin - Member Management
router.get("/members", protect, adminOnly, /* #swagger.tags = ['Members'] */ getAllMembers)
router.get("/members/:id", protect, adminOnly, /* #swagger.tags = ['Members'] */ getMemberProfile)

export default router
