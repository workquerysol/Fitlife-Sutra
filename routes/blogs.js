import express from "express"
const router = express.Router()

import { createBlog, getBlogs, getBlogById, updateBlog, deleteBlog } from "../controllers/blogs.js"

router.post("/", createBlog)
router.get("/", getBlogs)
router.get("/:id", getBlogById)
router.put("/:id", updateBlog)
router.delete("/:id", deleteBlog)

export default router