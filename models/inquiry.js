import mongoose from "mongoose"

const inquirySchema = mongoose.Schema(
    {

        name: {
            type: String,
            required: true
        },
        mobile: {
            type: Number,
            required: true
        },
        age: {
            type: Number,
        },
        height: {
            type: Number,
        },

        currentWeight: {
            type: Number,
        },
        desiredWeight: {
            type: Number,
        },
        medicalConditions: {
            type: String,
        },

        status: {
            type: String,
            enum: ["NEW", "FOLLOWED_UP", "CONVERTED", "REJECTED"],
            default: "NEW"
        },

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        notes: {
            type: String,
        },
    },
    {
        timestamps: true
    });

export default mongoose.model("Inquiry", inquirySchema);