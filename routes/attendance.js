import express from "express"
const router = express.Router()
import { addAttendance, getAttendanceByDate, toggleAttendance, getAttendanceByCycle } from "../controllers/attendance.js";

router.post("/", /* #swagger.tags = ['Attendance'] */ addAttendance)
router.get("/", /* #swagger.tags = ['Attendance'] */ getAttendanceByDate)
router.put("/toggle", /* #swagger.tags = ['Attendance'] */ toggleAttendance)
router.get("/cycle", /* #swagger.tags = ['Attendance'] */ getAttendanceByCycle)

export default router;
