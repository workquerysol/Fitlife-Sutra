import express from "express"
import { createInquiry, getInquiry } from "../controllers/inquiry.js"
const router = express.Router()

router.post("/", /* #swagger.tags = ['Inquiry'] */ createInquiry)
router.get("/", /* #swagger.tags = ['Inquiry'] */ getInquiry)

export default router
