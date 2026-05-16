import Membership from '../models/membership.js';
import Attendance from '../models/attendance.js';

export const addAttendance = async (req, res) => {
    const { date, memberId, status, markedBy, notes } = req.body;
    try {
        const membership = await Membership.findOne({ 
            _id: memberId, 
            status: "ACTIVE", 
            endDate: { $gte: new Date(date) } 
        });

        if (!membership) {
            return res.status(400).json({ success: false, message: "Invalid attendance request. Membership inactive or expired.", data: null });
        }

        const attendance = await Attendance.create({ 
            user_id: membership.user_id, 
            memberShipId: memberId, 
            attandanceDate: new Date(date),
            status: status || "PRESENT",
            markedBy,
            notes
        });

        if (attendance.status === "PRESENT") {
            await Membership.findByIdAndUpdate(
                memberId,
                { $inc: { attendanceUsed: 1 } },
                { new: true }
            );
        }

        return res.status(200).json({ success: true, message: "Attendance added successfully", data: attendance });
    }
    catch (error) {
        console.error("Error in adding attendance", error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Attendance already marked for this date", data: null });
        }
        return res.status(500).json({ success: false, message: "Error in adding attendance", data: null });
    }
}

export const getAttendanceByDate = async (req, res) => {
    const { memberId, user_id, startDate, endDate, month } = req.query;
    const queryUserId = user_id;
    const queryStartDate = startDate;
    const queryEndDate = endDate;
    const queryMonth = month;
    

    try {
        let query = {};
        
        if (queryMemberId) query.memberShipId = queryMemberId;
        if (queryUserId) query.user_id = queryUserId;

        if (queryStartDate && queryEndDate) {
            query.attandanceDate = {
                $gte: new Date(queryStartDate),
                $lte: new Date(queryEndDate)
            };
        } else if (queryMonth) {
            const year = new Date().getFullYear();
            const startOfMonth = new Date(year, queryMonth - 1, 1);
            const endOfMonth = new Date(year, queryMonth, 0);
            query.attandanceDate = {
                $gte: startOfMonth,
                $lte: endOfMonth
            };
        }

        const attendanceRecords = await Attendance.find(query).sort({ attandanceDate: -1 }).populate('user_id', 'name email').populate('memberShipId', 'planType');

        return res.status(200).json({ success: true, message: "Attendance records retrieved successfully", data: attendanceRecords });
    }
    catch (error) {
        console.error("Error in fetching attendance", error);
        return res.status(500).json({ success: false, message: "Error in fetching attendance", data: null });
    }
}
