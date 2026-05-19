import express from "express"
const router = express.Router()
import { addAttendance, getAttendanceByDate } from "../controllers/attendance.js";

router.post("/", /* #swagger.tags = ['Attendance'] */ addAttendance)
router.get("/", /* #swagger.tags = ['Attendance'] */ getAttendanceByDate)

export default router;
