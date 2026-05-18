import Testimonials from "../models/testimonials.js";



export const createTestimonial = async (req, res) => {
    try{
        const {comment, rating, ratedBy}=req.body;
        if(!commit || !rating || !ratedBy){
            return res.status(400).json({success:false, message:"all the fields are required"})
        }
        const testimonial=await Testimonials.create({
            comment, 
            rating,
            ratedBy,
        })
        return res.status(201).json({ success: true, message: "Testimonial created successfully", data: testimonial });
    }
    catch(error){
        console.error("error while creating the testimonial");
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getTestimonials=async (req, res)=>{
    try{
        const{userId, limit=10}=req.body;
        let query={};
        let res;
        if(userId){
            query.ratedBy=userId;
            res=await Testimonials.find(query);
        }
        else{
            res=await Testimonials.find(query).limit(limit);
        }
        return res.status(200).json({ success: true, message: "Testimonials fetched successfully", data: res });
    }
    catch(error){
        console.error("error while fetching the testimonial");
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}