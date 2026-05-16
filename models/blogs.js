import mongoose from "mongoose"

const blogSchema = mongoose.Schema({
    title: {
        type: String,
    },
    slug: {
        type: String,
        unique: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String
    },
    description: {
        type: String
    },
    image: {
        type: String
    },
    author: {
        type: String
    },
    status: {
        type: String,
        enum: ["DRAFT", "PUBLISHED"],
        default: "DRAFT"
    },
    featured: {
        type: Boolean,
        default: false
    },
    publishedAt: {
        type: Date,
    }

}, {
    timestamps: true
})

module.exports = mongoose.model("Blog", blogSchema)