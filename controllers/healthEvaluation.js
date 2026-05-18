import healthEvaluation from "../models/healthEvaluations.js"

export const createHealthEvaluation = async (req, res) => {
    try {
        const { userId, name, mobile, weight, height, evaluationDate, idealWeight, bodyAge, bodyFat, musclePercentage, visceralFat, bmr, bmi, muscle, notes } = req.body;
        if (!userId || !name || !mobile || !weight || !height || !evaluationDate) {
            return res.status(400).json({ success: false, error: "all fielda are required" })
        }
        const healthEvaluation = await healthEvaluation.create({
            userId,
            name,
            mobile,
            weight,
            height,
            evaluationDate,
            idealWeight,
            bodyAge,
            bodyFat,
            musclePercentage,
            visceralFat,
            bmr,
            bmi,
            muscle,
            notes
        })

        return res.status(201).json({ success: true, message: "Health evaluation created successfully", data: healthEvaluation })
    }
    catch (error) {
        console.error("error while creating the health evaluation");
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

export const getHealthEvaluation = async (req, res) => {
    try {
        const {userId, startDate, endDate, date}=req.body;
        if(!userId){
            return res.status(400).json({ success: false, error: "User ID is required" })
        }
        let query={userId};
        if(startDate&&endDate){
            query.evaluationDate={ $gte: startDate, $lte: endDate };
        }
        if(date){
            query.evaluationDate=new Date(date);
        }
        const healthEvaluation=await healthEvaluation.find(query);
        return res.status(200).json({ success: true, message: "Health evaluation fetched successfully", data: healthEvaluation });
    }
    catch (error) {
        console.error("error while creating the health evaluation");
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}