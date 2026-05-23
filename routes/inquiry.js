import express from "express"
import { createInquiry, getInquiry, updateInquiry } from "../controllers/inquiry.js"
import { protect, adminOnly } from "../middlewares/authMiddleware.js"
const router = express.Router()

router.post("/", /* #swagger.tags = ['Inquiry'] */ createInquiry)
router.get("/", protect, adminOnly, /* #swagger.tags = ['Inquiry'] */ getInquiry)
router.patch("/:id", protect, adminOnly, /* #swagger.tags = ['Inquiry'] */ updateInquiry)

export default router
