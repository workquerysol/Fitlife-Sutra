import mongoose from "mongoose"

const testimonialSchema = mongoose.Schema({
    comment: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    ratedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    isApproved: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
})

export default mongoose.model("Testimonial", testimonialSchema)