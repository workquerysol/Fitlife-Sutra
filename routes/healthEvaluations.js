import express from "express"
import { protect, adminOnly } from "../middlewares/authMiddleware.js"
const router = express.Router()

import { createHealthEvaluation, getHealthEvaluation, registerMember, setupMemberPlan, updateHealthEvaluation, deleteHealthEvaluation } from "../controllers/healthEvaluation.js"

router.post("/register-member", protect, adminOnly, /* #swagger.tags = ['Health Evaluations'] */ registerMember)
router.post("/setup-plan", protect, adminOnly, /* #swagger.tags = ['Health Evaluations'] */ setupMemberPlan)
router.post("/", protect, adminOnly, /* #swagger.tags = ['Health Evaluations'] */ createHealthEvaluation)
router.get("/", protect, adminOnly, /* #swagger.tags = ['Health Evaluations'] */ getHealthEvaluation)
router.put("/:id", protect, adminOnly, /* #swagger.tags = ['Health Evaluations'] */ updateHealthEvaluation)
router.delete("/:id", protect, adminOnly, /* #swagger.tags = ['Health Evaluations'] */ deleteHealthEvaluation)

export default router
