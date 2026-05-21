import express from "express"
const router = express.Router()

import { createHealthEvaluation, getHealthEvaluation, registerMember } from "../controllers/healthEvaluation.js"

router.post("/", /* #swagger.tags = ['Health Evaluations'] */ createHealthEvaluation)
router.post("/register-member", /* #swagger.tags = ['Health Evaluations'] */ registerMember)
router.get("/", /* #swagger.tags = ['Health Evaluations'] */ getHealthEvaluation)

export default router