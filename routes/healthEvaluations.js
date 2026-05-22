import express from "express"
const router = express.Router()

import { createHealthEvaluation, getHealthEvaluation, registerMember, updateHealthEvaluation, deleteHealthEvaluation } from "../controllers/healthEvaluation.js"

router.post("/", /* #swagger.tags = ['Health Evaluations'] */ createHealthEvaluation)
router.post("/register-member", /* #swagger.tags = ['Health Evaluations'] */ registerMember)
router.get("/", /* #swagger.tags = ['Health Evaluations'] */ getHealthEvaluation)
router.put("/:id", /* #swagger.tags = ['Health Evaluations'] */ updateHealthEvaluation)
router.delete("/:id", /* #swagger.tags = ['Health Evaluations'] */ deleteHealthEvaluation)

export default router