import express from "express"
import { protect, adminOnly } from "../middlewares/authMiddleware.js"
const router = express.Router()

import { createTestimonial, getTestimonials } from "../controllers/testimonials.js"

router.get("/", /* #swagger.tags = ['Testimonials'] */ getTestimonials)
router.post("/", protect, /* #swagger.tags = ['Testimonials'] */ createTestimonial)

export default router
