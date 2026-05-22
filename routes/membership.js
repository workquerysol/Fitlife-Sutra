import express from "express"
const router = express.Router()

import { getMembershipByUserId, renewMembership } from "../controllers/membershipController.js"

router.get("/", /* #swagger.tags = ['Memberships'] */ getMembershipByUserId)
router.post("/renew", /* #swagger.tags = ['Memberships'] */ renewMembership)

export default router
