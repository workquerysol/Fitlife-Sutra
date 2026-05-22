import Membership from "../models/membership.js";
import User from "../models/userModel.js";

// @desc    Get membership by user ID (latest or active)
// @route   GET /api/v1/memberships
// @access  Admin
export const getMembershipByUserId = async (req, res) => {
    try {
        const { userId, status } = req.query;

        if (!userId) {
            return res.status(400).json({ success: false, message: "userId is required", data: null });
        }

        // Verify user exists
        const user = await User.findById(userId).select("name email phone");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found", data: null });
        }

        let query = { user_id: userId };
        if (status) {
            query.status = status;
        }

        const memberships = await Membership.find(query).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Memberships fetched successfully",
            data: {
                user,
                memberships
            }
        });
    }
    catch (error) {
        console.error("Error fetching membership:", error);
        return res.status(500).json({ success: false, message: "Error fetching membership", data: null });
    }
};

// @desc    Renew a membership cycle (creates new membership, rolls over unused days)
// @route   POST /api/v1/memberships/renew
// @access  Admin
export const renewMembership = async (req, res) => {
    try {
        const {
            userId,
            planType,
            startDate,
            totalAmount,
            amountPaid,
            durationDays: customDuration
        } = req.body;

        if (!userId || !planType) {
            return res.status(400).json({ success: false, message: "userId and planType are required", data: null });
        }

        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found", data: null });
        }

        // Find the current/latest membership to calculate rollover
        const currentMembership = await Membership.findOne({ user_id: userId }).sort({ createdAt: -1 });

        let rolloverDays = 0;
        if (currentMembership) {
            // Mark the old membership as expired
            if (currentMembership.status === "ACTIVE") {
                currentMembership.status = "EXPIRED";
                await currentMembership.save();
            }

            // Calculate unused days from current membership
            const totalCycleDays = currentMembership.durationDays + (currentMembership.rolloverDays || 0);
            const usedDays = currentMembership.attendanceUsed || 0;
            rolloverDays = Math.max(0, totalCycleDays - usedDays);
        }

        // Determine plan duration
        let durationDays = customDuration || 30;
        if (!customDuration) {
            const planLower = planType.toLowerCase();
            if (planLower.includes("5-day") || planLower.includes("5 day")) {
                durationDays = 5;
            } else if (planLower.includes("15-day") || planLower.includes("15 day")) {
                durationDays = 15;
            } else if (planLower.includes("25-day") || planLower.includes("25 day")) {
                durationDays = 25;
            }
        }

        // Calculate finances
        const parsedTotal = Number(totalAmount) || 0;
        const parsedPaid = Number(amountPaid) || 0;
        const dueAmount = Math.max(0, parsedTotal - parsedPaid);

        let paymentStatus = "UNPAID";
        if (dueAmount === 0 && parsedTotal > 0) {
            paymentStatus = "PAID";
        } else if (parsedPaid > 0 && dueAmount > 0) {
            paymentStatus = "PARTIALLY_PAID";
        }

        const start = startDate ? new Date(startDate) : new Date();
        const effectiveDuration = durationDays + rolloverDays;
        const end = new Date(start.getTime() + effectiveDuration * 24 * 60 * 60 * 1000);

        // Create new membership
        const newMembership = await Membership.create({
            user_id: userId,
            planType,
            durationDays,
            startDate: start,
            endDate: end,
            rolloverDays,
            attendanceUsed: 0,
            status: "ACTIVE",
            totalAmount: parsedTotal,
            amountPaid: parsedPaid,
            dueAmount,
            paymentStatus
        });

        return res.status(201).json({
            success: true,
            message: `Membership renewed successfully${rolloverDays > 0 ? ` with ${rolloverDays} carry-over days` : ""}`,
            data: {
                membership: newMembership,
                rolloverDays,
                previousMembershipId: currentMembership?._id || null
            }
        });
    }
    catch (error) {
        console.error("Error renewing membership:", error);
        return res.status(500).json({ success: false, message: "Error renewing membership", data: null });
    }
};
