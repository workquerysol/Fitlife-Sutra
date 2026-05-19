import express from "express"
import {
  loginUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  getUserDashboard,
} from "../controllers/userController.js"
import { protect } from "../middlewares/authMiddleware.js"

const router = express.Router()

router.post("/register", /* #swagger.tags = ['Users'] */ registerUser)
router.post("/login", /* #swagger.tags = ['Users'] */ loginUser)
router.post("/logout", /* #swagger.tags = ['Users'] */ logoutUser)
router.post("/forgot-password", /* #swagger.tags = ['Users'] */ forgotPassword)
router.post("/reset-password/:token", /* #swagger.tags = ['Users'] */ resetPassword)
router
  .route("/profile")
  .get(protect, /* #swagger.tags = ['Users'] */ getUserProfile)
  .put(protect, /* #swagger.tags = ['Users'] */ updateUserProfile)

router.get("/dashboard", protect, /* #swagger.tags = ['Users'] */ getUserDashboard)

export default router
