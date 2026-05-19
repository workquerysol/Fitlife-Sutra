import express from "express"
const router = express.Router()

import { createBlog, getBlogs, getBlogById, updateBlog, deleteBlog } from "../controllers/blogs.js"

router.post("/", /* #swagger.tags = ['Blogs'] */ createBlog)
router.get("/", /* #swagger.tags = ['Blogs'] */ getBlogs)
router.get("/:id", /* #swagger.tags = ['Blogs'] */ getBlogById)
router.put("/:id", /* #swagger.tags = ['Blogs'] */ updateBlog)
router.delete("/:id", /* #swagger.tags = ['Blogs'] */ deleteBlog)

export default router