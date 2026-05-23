import express from "express"
import { protect, adminOnly } from "../middlewares/authMiddleware.js"
const router = express.Router()

import { getMembershipByUserId, renewMembership } from "../controllers/membershipController.js"

router.get("/", protect, adminOnly, /* #swagger.tags = ['Memberships'] */ getMembershipByUserId)
router.post("/renew", protect, adminOnly, /* #swagger.tags = ['Memberships'] */ renewMembership)

export default router
