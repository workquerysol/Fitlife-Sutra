import Testimonials from "../models/testimonials.js"

export const createTestimonial = async (req, res) => {
    try {
        const { comment, rating } = req.body
        const ratedBy = req.body.ratedBy || req.user?._id
        if (!comment || !rating || !ratedBy) {
            return res.status(400).json({ success: false, statusCode: 400, message: "All fields are required" })
        }
        const testimonial = await Testimonials.create({ comment, rating, ratedBy })
        return res.status(201).json({ success: true, statusCode: 201, message: "Testimonial created successfully", data: testimonial })
    } catch (error) {
        console.error("Error while creating testimonial:", error)
        return res.status(500).json({ success: false, statusCode: 500, message: "Internal server error" })
    }
}

export const getTestimonials = async (req, res) => {
    try {
        const { userId, limit = 30 } = req.query
        let query = {}
        let testimonials
        if (userId) {
            query.ratedBy = userId
            testimonials = await Testimonials.find(query).populate('ratedBy', 'name location')
        } else {
            testimonials = await Testimonials.find(query)
                .populate('ratedBy', 'name location')
                .sort({ createdAt: -1 })
                .limit(Number(limit))
        }
        return res.status(200).json({ success: true, statusCode: 200, message: "Testimonials fetched successfully", data: testimonials })
    } catch (error) {
        console.error("Error while fetching testimonials:", error)
        return res.status(500).json({ success: false, statusCode: 500, message: "Internal server error" })
    }
}
