import express from "express"
import { protect, adminOnly } from "../middlewares/authMiddleware.js"
const router = express.Router()
import { addAttendance, getAttendanceByDate, toggleAttendance, getAttendanceByCycle, getMyAttendanceCycle } from "../controllers/attendance.js"

router.get("/my-cycle", protect, /* #swagger.tags = ['Attendance'] */ getMyAttendanceCycle)
router.post("/", protect, adminOnly, /* #swagger.tags = ['Attendance'] */ addAttendance)
router.get("/", protect, adminOnly, /* #swagger.tags = ['Attendance'] */ getAttendanceByDate)
router.put("/toggle", protect, adminOnly, /* #swagger.tags = ['Attendance'] */ toggleAttendance)
router.get("/cycle", protect, adminOnly, /* #swagger.tags = ['Attendance'] */ getAttendanceByCycle)

export default router
