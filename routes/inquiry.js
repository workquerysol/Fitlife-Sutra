import express from "express"
import { createInquiry, getInquiry } from "../controllers/inquiry.js"
const router = express.Router()

router.post("/", createInquiry)
router.get("/", getInquiry)

export default router
