import mongoose from "mongoose"

const inquirySchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    memberShipId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Membership"
    },
    status: {
        type: String,
        enum: ["PRESENT", "ABSENT"],
        default: "ABSENT"
    },
    markedBy: {
        type: String
    },
    notes: {
        type: String
    },
    attandanceDate: {
        type: Date,
        unique:true
    }
}, {
    timestamps: true
},)

attendanceSchema.index({ user_id: 1, attandanceDate: 1 })
module.exports = mongoose.model("Attendance", attendanceSchema);