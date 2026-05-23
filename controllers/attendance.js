import Membership from '../models/membership.js'
import Attendance from '../models/attendance.js'

// @desc    Add attendance for a member
// @route   POST /api/v1/attendance
// @access  Admin
export const addAttendance = async (req, res) => {
    const { date, memberId, status, markedBy, notes } = req.body
    try {
        const membership = await Membership.findOne({
            _id: memberId,
            status: "ACTIVE",
            endDate: { $gte: new Date(date) }
        })

        if (!membership) {
            return res.status(400).json({ success: false, statusCode: 400, message: "Invalid attendance request. Membership inactive or expired.", data: null })
        }

        const attendance = await Attendance.create({
            user_id: membership.user_id,
            memberShipId: memberId,
            attandanceDate: new Date(date),
            status: status || "PRESENT",
            markedBy,
            notes
        })

        if (attendance.status === "PRESENT") {
            await Membership.findByIdAndUpdate(memberId, { $inc: { attendanceUsed: 1 } }, { new: true })
        }

        return res.status(200).json({ success: true, statusCode: 200, message: "Attendance added successfully", data: attendance })
    } catch (error) {
        console.error("Error in adding attendance", error)
        if (error.code === 11000) {
            return res.status(400).json({ success: false, statusCode: 400, message: "Attendance already marked for this date", data: null })
        }
        return res.status(500).json({ success: false, statusCode: 500, message: "Error in adding attendance", data: null })
    }
}

// @desc    Get attendance records by date range, member, or month
// @route   GET /api/v1/attendance
// @access  Admin
export const getAttendanceByDate = async (req, res) => {
    const { memberId, user_id, startDate, endDate, month } = req.query

    try {
        let query = {}

        if (memberId) query.memberShipId = memberId
        if (user_id) query.user_id = user_id

        if (startDate && endDate) {
            query.attandanceDate = { $gte: new Date(startDate), $lte: new Date(endDate) }
        } else if (month) {
            const year = parseInt(req.query.year) || new Date().getFullYear()
            const startOfMonth = new Date(year, month - 1, 1)
            const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999)
            query.attandanceDate = { $gte: startOfMonth, $lte: endOfMonth }
        }

        const attendanceRecords = await Attendance.find(query)
            .sort({ attandanceDate: -1 })
            .populate('user_id', 'name email')
            .populate('memberShipId', 'planType')

        return res.status(200).json({ success: true, statusCode: 200, message: "Attendance records retrieved successfully", data: attendanceRecords })
    } catch (error) {
        console.error("Error in fetching attendance", error)
        return res.status(500).json({ success: false, statusCode: 500, message: "Error in fetching attendance", data: null })
    }
}

// @desc    Toggle attendance for a specific day (present <-> absent)
// @route   PUT /api/v1/attendance/toggle
// @access  Admin
export const toggleAttendance = async (req, res) => {
    const { memberId, date, markedBy } = req.body

    try {
        if (!memberId || !date) {
            return res.status(400).json({ success: false, statusCode: 400, message: "memberId and date are required", data: null })
        }

        const membership = await Membership.findById(memberId)
        if (!membership) {
            return res.status(404).json({ success: false, statusCode: 404, message: "Membership not found", data: null })
        }

        const targetDate = new Date(date)
        targetDate.setHours(0, 0, 0, 0)

        const endOfDay = new Date(targetDate)
        endOfDay.setHours(23, 59, 59, 999)

        const existing = await Attendance.findOne({
            user_id: membership.user_id,
            memberShipId: memberId,
            attandanceDate: { $gte: targetDate, $lte: endOfDay }
        })

        if (existing) {
            const newStatus = existing.status === "PRESENT" ? "ABSENT" : "PRESENT"
            existing.status = newStatus
            existing.markedBy = markedBy || existing.markedBy
            await existing.save()

            if (newStatus === "ABSENT") {
                await Membership.findByIdAndUpdate(memberId, { $inc: { attendanceUsed: -1 } })
            } else {
                await Membership.findByIdAndUpdate(memberId, { $inc: { attendanceUsed: 1 } })
            }

            return res.status(200).json({ success: true, statusCode: 200, message: `Attendance toggled to ${newStatus}`, data: existing })
        } else {
            const attendance = await Attendance.create({
                user_id: membership.user_id,
                memberShipId: memberId,
                attandanceDate: targetDate,
                status: "PRESENT",
                markedBy
            })

            await Membership.findByIdAndUpdate(memberId, { $inc: { attendanceUsed: 1 } })

            return res.status(201).json({ success: true, statusCode: 201, message: "Attendance marked as PRESENT", data: attendance })
        }
    } catch (error) {
        console.error("Error toggling attendance:", error)
        return res.status(500).json({ success: false, statusCode: 500, message: "Error toggling attendance", data: null })
    }
}

// @desc    Get attendance cycle grid for the currently authenticated user
// @route   GET /api/v1/attendance/my-cycle
// @access  Authenticated user
export const getMyAttendanceCycle = async (req, res) => {
    try {
        const userId = req.user._id

        const membership = await Membership.findOne({ user_id: userId, status: 'ACTIVE' }).sort({ createdAt: -1 })
        if (!membership) {
            return res.status(404).json({ success: false, statusCode: 404, message: "No active membership found", data: null })
        }

        const memberId = membership._id
        const { startDate, endDate, durationDays, rolloverDays, attendanceUsed, totalAmount, amountPaid, dueAmount, paymentStatus, planType } = membership
        const cycleStart = new Date(startDate)
        const cycleEnd = new Date(endDate)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const records = await Attendance.find({
            memberShipId: memberId,
            attandanceDate: { $gte: cycleStart, $lte: cycleEnd }
        }).sort({ attandanceDate: 1 })

        const attendanceMap = {}
        records.forEach(record => {
            const dateKey = record.attandanceDate.toISOString().split('T')[0]
            attendanceMap[dateKey] = record.status
        })

        const totalDays = durationDays + (rolloverDays || 0)
        const grid = []
        for (let i = 0; i < totalDays; i++) {
            const dayDate = new Date(cycleStart)
            dayDate.setDate(dayDate.getDate() + i)
            dayDate.setHours(0, 0, 0, 0)
            const dateKey = dayDate.toISOString().split('T')[0]
            let status
            if (dayDate > today) {
                status = "FUTURE"
            } else if (attendanceMap[dateKey]) {
                status = attendanceMap[dateKey]
            } else {
                status = "ABSENT"
            }
            grid.push({ day: i + 1, date: dateKey, status })
        }

        const diffTime = cycleEnd.getTime() - today.getTime()
        const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
        const elapsedTime = today.getTime() - cycleStart.getTime()
        const dayInCycle = Math.min(totalDays, Math.max(1, Math.ceil(elapsedTime / (1000 * 60 * 60 * 24)) + 1))

        return res.status(200).json({
            success: true, statusCode: 200,
            message: "Attendance cycle retrieved successfully",
            data: {
                membership: { _id: memberId, planType, startDate, endDate, durationDays, rolloverDays, attendanceUsed, status: membership.status, totalAmount, amountPaid, dueAmount, paymentStatus },
                cycleInfo: { totalDays, dayInCycle, daysLeft, sessionsCompleted: attendanceUsed, rolloverDays: rolloverDays || 0 },
                grid
            }
        })
    } catch (error) {
        console.error("Error fetching my attendance cycle:", error)
        return res.status(500).json({ success: false, statusCode: 500, message: "Error fetching attendance cycle", data: null })
    }
}

// @desc    Get attendance grid for a membership cycle
// @route   GET /api/v1/attendance/cycle
// @access  Admin
export const getAttendanceByCycle = async (req, res) => {
    const { memberId } = req.query

    try {
        if (!memberId) {
            return res.status(400).json({ success: false, statusCode: 400, message: "memberId is required", data: null })
        }

        const membership = await Membership.findById(memberId).populate('user_id', 'name email phone')
        if (!membership) {
            return res.status(404).json({ success: false, statusCode: 404, message: "Membership not found", data: null })
        }

        const { startDate, endDate, durationDays, rolloverDays, attendanceUsed } = membership
        const cycleStart = new Date(startDate)
        const cycleEnd = new Date(endDate)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const records = await Attendance.find({
            memberShipId: memberId,
            attandanceDate: { $gte: cycleStart, $lte: cycleEnd }
        }).sort({ attandanceDate: 1 })

        const attendanceMap = {}
        records.forEach(record => {
            const dateKey = record.attandanceDate.toISOString().split('T')[0]
            attendanceMap[dateKey] = record.status
        })

        const totalDays = durationDays + (rolloverDays || 0)
        const grid = []
        for (let i = 0; i < totalDays; i++) {
            const dayDate = new Date(cycleStart)
            dayDate.setDate(dayDate.getDate() + i)
            dayDate.setHours(0, 0, 0, 0)

            const dateKey = dayDate.toISOString().split('T')[0]
            let status

            if (dayDate > today) {
                status = "FUTURE"
            } else if (attendanceMap[dateKey]) {
                status = attendanceMap[dateKey]
            } else {
                status = "ABSENT"
            }

            grid.push({ day: i + 1, date: dateKey, status })
        }

        const diffTime = cycleEnd.getTime() - today.getTime()
        const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))

        const elapsedTime = today.getTime() - cycleStart.getTime()
        const dayInCycle = Math.min(totalDays, Math.max(1, Math.ceil(elapsedTime / (1000 * 60 * 60 * 24)) + 1))

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Attendance cycle grid retrieved successfully",
            data: {
                membership: {
                    _id: membership._id,
                    user: membership.user_id,
                    planType: membership.planType,
                    startDate: membership.startDate,
                    endDate: membership.endDate,
                    durationDays,
                    rolloverDays,
                    attendanceUsed,
                    status: membership.status
                },
                cycleInfo: { totalDays, dayInCycle, daysLeft, sessionsCompleted: attendanceUsed, rolloverDays: rolloverDays || 0 },
                grid
            }
        })
    } catch (error) {
        console.error("Error fetching attendance cycle:", error)
        return res.status(500).json({ success: false, statusCode: 500, message: "Error fetching attendance cycle", data: null })
    }
}
