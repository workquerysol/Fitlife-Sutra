import express from "express"
const router = express.Router()

import { createTestimonial, getTestimonials } from "../controllers/testimonials.js"

router.post("/", /* #swagger.tags = ['Testimonials'] */ createTestimonial)
router.get("/", /* #swagger.tags = ['Testimonials'] */ getTestimonials)

export default router