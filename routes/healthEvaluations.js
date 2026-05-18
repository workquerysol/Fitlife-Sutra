import express from "express"
const router = express.Router()

import { createHealthEvaluation, getHealthEvaluation } from "../controllers/healthEvaluation.js"

router.post("/", createHealthEvaluation)
router.get("/", getHealthEvaluation)

export default router