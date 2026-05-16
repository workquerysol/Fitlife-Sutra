import express from "express"
const router = express.Router()
import { addAttendance, getAttendanceByDate } from "../controllers/attendance.js";

router.post("/", addAttendance)
router.get("/", getAttendanceByDate)

export default router;
