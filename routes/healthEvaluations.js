import express from "express"
const router = express.Router()

import { createHealthEvaluation, getHealthEvaluation } from "../controllers/healthEvaluation.js"

router.post("/", /* #swagger.tags = ['Health Evaluations'] */ createHealthEvaluation)
router.get("/", /* #swagger.tags = ['Health Evaluations'] */ getHealthEvaluation)

export default router