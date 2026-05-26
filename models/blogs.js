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
    tags: {
        type: [String],
        default: []
    },
    publishedAt: {
        type: Date,
    },
    views: {
        type: Number,
        default: 0,
    }

}, {
    timestamps: true
})

export default mongoose.model("Blog", blogSchema)