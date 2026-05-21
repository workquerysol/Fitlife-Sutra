import HealthEvaluation from "../models/healthEvaluations.js";
import User from "../models/userModel.js";
import Membership from "../models/membership.js";

// Helper function to calculate BMI and its classification
const calculateBmiDetails = (weight, height) => {
    if (!weight || !height) return { bmi: undefined, classification: undefined };
    const bmi = Number((weight / ((height / 100) ** 2)).toFixed(2));
    let classification = "NORMAL";
    if (bmi < 18.5) {
        classification = "LOW";
    } else if (bmi >= 18.5 && bmi < 25) {
        classification = "NORMAL";
    } else if (bmi >= 25 && bmi < 30) {
        classification = "HIGH";
    } else {
        classification = "OBESE";
    }
    return { bmi, classification };
};

// @desc Create health evaluation
// route POST /api/v1/healthEvaluations
// @access Public/Admin
export const createHealthEvaluation = async (req, res) => {
    try {
        const { 
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
        } = req.body;

        if (!userId || !weight || !height) {
            return res.status(400).json({ success: false, error: "userId, weight, and height are required" });
        }

        // Validate user existence
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        // Optionally update user name or phone if provided and changed
        let userUpdated = false;
        if (name && name !== user.name) {
            user.name = name;
            userUpdated = true;
        }
        if (mobile && mobile !== user.phone) {
            user.phone = mobile;
            userUpdated = true;
        }
        if (userUpdated) {
            await user.save();
        }

        // Calculate BMI & classification if not manually supplied
        const { bmi: calcBmi, classification: calcBmiClass } = calculateBmiDetails(weight, height);

        const activeBmi = bmi || calcBmi;
        const activeBmiClass = calcBmiClass;

        // Classify bodyFat and muscle percentage
        let activeBodyFatClass = "NORMAL";
        if (bodyFat) {
            if (bodyFat < 10) activeBodyFatClass = "LOW";
            else if (bodyFat > 25) activeBodyFatClass = "HIGH";
        }

        let activeMuscleClass = "NORMAL";
        if (musclePercentage) {
            if (musclePercentage < 30) activeMuscleClass = "LOW";
            else if (musclePercentage > 50) activeMuscleClass = "HIGH";
        }

        const evaluation = await HealthEvaluation.create({
            userId,
            evaluationDate: evaluationDate || new Date(),
            height,
            weight,
            idealWeight,
            bodyAge,
            bodyFat,
            musclePercentage,
            visceralFat,
            bmr,
            bmi: activeBmi,
            indicators: {
                bmi: activeBmiClass,
                bodyFat: activeBodyFatClass,
                muscle: muscle || activeMuscleClass
            },
            notes
        });

        return res.status(201).json({ 
            success: true, 
            message: "Health evaluation created successfully", 
            data: evaluation 
        });
    }
    catch (error) {
        console.error("Error while creating the health evaluation:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// @desc Get health evaluation history
// route GET /api/v1/healthEvaluations
// @access Public/Admin
export const getHealthEvaluation = async (req, res) => {
    try {
        // GET request query params mapping with req.body fallback
        const userId = req.query.userId || req.body.userId;
        const startDate = req.query.startDate || req.body.startDate;
        const endDate = req.query.endDate || req.body.endDate;
        const date = req.query.date || req.body.date;

        if (!userId) {
            return res.status(400).json({ success: false, error: "User ID is required" });
        }

        let query = { userId };
        if (startDate && endDate) {
            query.evaluationDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }
        if (date) {
            query.evaluationDate = new Date(date);
        }

        const evaluations = await HealthEvaluation.find(query).sort({ evaluationDate: -1 });

        return res.status(200).json({ 
            success: true, 
            message: "Health evaluations fetched successfully", 
            data: evaluations 
        });
    }
    catch (error) {
        console.error("Error while fetching health evaluations:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// @desc Register a new member (Admin action: creates User, Membership & Health Markers)
// route POST /api/v1/healthEvaluations/register-member
// @access Public/Admin
export const registerMember = async (req, res) => {
    try {
        const {
            name,
            email,
            age,
            gender,
            phone,
            location,
            planType,
            startDate,
            totalAmount,
            amountPaid,
            height,
            weight,
            idealWeight,
            notes
        } = req.body;

        if (!name || !phone || !planType) {
            return res.status(400).json({ success: false, error: "Name, phone number, and membership plan are required." });
        }

        // Generate email if not provided
        let memberEmail = email?.trim().toLowerCase();
        if (!memberEmail) {
            const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
            const phoneSuffix = phone.replace(/[^0-9]/g, "").slice(-4) || Math.floor(Math.random() * 9000 + 1000);
            memberEmail = `${cleanName}${phoneSuffix}@vitalityclub.com`;
        }

        // Check user existence
        const userExists = await User.findOne({ email: memberEmail });
        if (userExists) {
            return res.status(409).json({ success: false, error: `A member with email ${memberEmail} already exists.` });
        }

        // Create new User
        const defaultPassword = "VitalityClub123!";
        const newMember = await User.create({
            name,
            email: memberEmail,
            phone,
            password: defaultPassword,
            gender: gender || "Male",
            age: age || 25,
            location: location || "",
            role: "user"
        });

        // Determine plan duration in days
        let durationDays = 30; // default
        const planLower = planType.toLowerCase();
        if (planLower.includes("5-day") || planLower.includes("5 day")) {
            durationDays = 5;
        } else if (planLower.includes("15-day") || planLower.includes("15 day")) {
            durationDays = 15;
        } else if (planLower.includes("25-day") || planLower.includes("25 day")) {
            durationDays = 25;
        }

        // Calculate financial markers
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
        const end = new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000);

        // Create Membership
        const membership = await Membership.create({
            user_id: newMember._id,
            planType,
            durationDays,
            startDate: start,
            endDate: end,
            totalAmount: parsedTotal,
            amountPaid: parsedPaid,
            dueAmount: dueAmount,
            status: "ACTIVE",
            paymentStatus
        });

        // Create Initial Health Evaluation if markers are supplied
        let initialEvaluation = null;
        if (height || weight || idealWeight || notes) {
            const { bmi: calcBmi, classification: calcBmiClass } = calculateBmiDetails(Number(weight), Number(height));

            initialEvaluation = await HealthEvaluation.create({
                userId: newMember._id,
                evaluationDate: start,
                height: height ? Number(height) : undefined,
                weight: weight ? Number(weight) : undefined,
                idealWeight: idealWeight ? Number(idealWeight) : undefined,
                bmi: calcBmi,
                indicators: {
                    bmi: calcBmiClass,
                    bodyFat: "NORMAL",
                    muscle: "NORMAL"
                },
                notes: notes || ""
            });
        }

        return res.status(201).json({
            success: true,
            message: "Member registered and initialized successfully",
            data: {
                user: {
                    _id: newMember._id,
                    name: newMember.name,
                    email: newMember.email,
                    phone: newMember.phone,
                    gender: newMember.gender,
                    age: newMember.age,
                    location: newMember.location
                },
                membership,
                healthEvaluation: initialEvaluation
            }
        });
    }
    catch (error) {
        console.error("Error during member registration:", error);
        return res.status(500).json({ success: false, message: "Internal server error during registration" });
    }
};