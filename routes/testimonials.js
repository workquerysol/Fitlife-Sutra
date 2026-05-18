import express from "express"
const router = express.Router()

import { createTestimonial, getTestimonials } from "../controllers/testimonials.js"

router.post("/", createTestimonial)
router.get("/", getTestimonials)

export default router