import express from "express"
import multer from "multer"
const router = express.Router()

const upload = multer({ dest: "uploads/" })

import { createBlog, getBlogs, getBlogById, updateBlog, deleteBlog, uploadImage } from "../controllers/blogs.js"

router.post("/", /* #swagger.tags = ['Blogs'] */ createBlog)
router.post("/upload", upload.single("image"), uploadImage)
router.get("/", /* #swagger.tags = ['Blogs'] */ getBlogs)
router.get("/:id", /* #swagger.tags = ['Blogs'] */ getBlogById)
router.put("/:id", /* #swagger.tags = ['Blogs'] */ updateBlog)
router.delete("/:id", /* #swagger.tags = ['Blogs'] */ deleteBlog)

export default router