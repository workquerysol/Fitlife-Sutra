import mongoose from "mongoose";

const healthEvaluationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    evaluationDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    height: {
      type: Number, // in cm
    },

    weight: {
      type: Number, // in kg
    },

    idealWeight: {
      type: Number, // in kg
    },

    bodyAge: {
      type: Number,
    },

    bodyFat: {
      type: Number, // %
    },

    musclePercentage: {
      type: Number, // %
    },

    visceralFat: {
      type: Number,
    },

    bmr: {
      type: Number, // Basal Metabolic Rate
    },

    bmi: {
      type: Number,
    },

    indicators: {
      bmi: {
        type: String,
        enum: ["LOW", "NORMAL", "HIGH", "OBESE"],
      },

      bodyFat: {
        type: String,
        enum: ["LOW", "NORMAL", "HIGH"],
      },

      muscle: {
        type: String,
        enum: ["LOW", "NORMAL", "HIGH"],
      },
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user history
healthEvaluationSchema.index({
  userId: 1,
  evaluationDate: -1,
});

module.exports = mongoose.model(
  "HealthEvaluation",
  healthEvaluationSchema
);