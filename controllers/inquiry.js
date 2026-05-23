import Inquiry from "../models/inquiry.js"

export const createInquiry = async (req, res) => {
    try {
        const { name, mobile, age, height, currentWeight, desiredWeight, medicalConditions, status, assignedTo, notes } = req.body
        if (!name || !mobile) {
            return res.status(400).json({ success: false, statusCode: 400, error: "Name and mobile are required" })
        }

        const inquiry = await Inquiry.create({
            name, mobile, age, height, currentWeight, desiredWeight, medicalConditions, status, assignedTo, notes
        })

        return res.status(201).json({ success: true, statusCode: 201, data: inquiry })
    } catch (error) {
        return res.status(500).json({ success: false, statusCode: 500, error: error.message })
    }
}

export const getInquiry = async (req, res) => {
    try {
        const inquiry = await Inquiry.find().sort({ createdAt: -1 })
        return res.status(200).json({ success: true, statusCode: 200, message: "Inquiry fetched successfully", data: inquiry })
    } catch (error) {
        return res.status(500).json({ success: false, statusCode: 500, error: error.message })
    }
}

export const updateInquiry = async (req, res) => {
    try {
        const { id } = req.params
        const { status, notes, assignedTo } = req.body

        const inquiry = await Inquiry.findById(id)
        if (!inquiry) {
            return res.status(404).json({ success: false, statusCode: 404, error: "Inquiry not found" })
        }

        const validStatuses = ["NEW", "FOLLOWED_UP", "CONVERTED", "REJECTED"]
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ success: false, statusCode: 400, error: "Invalid status value" })
        }

        if (status) inquiry.status = status
        if (notes !== undefined) inquiry.notes = notes
        if (assignedTo !== undefined) inquiry.assignedTo = assignedTo || null

        await inquiry.save()

        return res.status(200).json({ success: true, statusCode: 200, message: "Inquiry updated successfully", data: inquiry })
    } catch (error) {
        return res.status(500).json({ success: false, statusCode: 500, error: error.message })
    }
}
