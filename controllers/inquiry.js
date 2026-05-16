import Inquiry from "../models/inquiry.js"

export const createInquiry = async (req, res) => {
    try {
        const { name, mobile, age, height, currentWeight, desiredWeight, medicalConditions, status, assignedTo, notes } = req.body
        if (!name || !mobile) {
            return res.status(400).json({ success: false, error: "Name and mobile are required" })
        }

        const inquiry = await Inquiry.create({
            name,
            mobile,
            age,
            height,
            currentWeight,
            desiredWeight,
            medicalConditions,
            status,
            assignedTo,
            notes
        })

        return res.status(201).json({ success: true, data: inquiry })
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message })
    }
}


export const getInquiry = async (req, res) => {
    try {
        const inquiry = await Inquiry.find();

        return res.status(201).json({ success: true, message: "inquiry fetched successfully", data: inquiry })
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message })
    }
}