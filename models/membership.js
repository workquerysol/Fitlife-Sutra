import mongoose from "mongoose"

const membershipSchema = mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    planType:{
        type:String,
    },
    durationDays:{
        type:Number,
    },
    startDate:{
        type:Date,
    },
    endDate:{
        type:Date
    },
    rolloverDays:{
        type:Number,
        default:0
    },
    attendanceUsed:{
        type:Number,
        default:0
    },
    status:{

        type:String,
        enum:["ACTIVE","EXPIRED","PAUSED"],
        default:"ACTIVE"
        
    },
    paymentStatus:{
        type:String,
        enum:["PAID","UNPAID"],
        
    }
    
})
module.exports=mongoose.model("Membership",membershipSchema);