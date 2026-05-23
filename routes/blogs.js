import express from "express"
import multer from "multer"
import { protect, adminOnly } from "../middlewares/authMiddleware.js"
const router = express.Router()

const upload = multer({ storage: multer.memoryStorage() })

import { createBlog, getBlogs, getBlogById, updateBlog, deleteBlog, uploadImage } from "../controllers/blogs.js"

router.get("/", /* #swagger.tags = ['Blogs'] */ getBlogs)
router.get("/:id", /* #swagger.tags = ['Blogs'] */ getBlogById)
router.post("/", protect, adminOnly, /* #swagger.tags = ['Blogs'] */ createBlog)
router.post("/upload", protect, adminOnly, upload.single("image"), uploadImage)
router.put("/:id", protect, adminOnly, /* #swagger.tags = ['Blogs'] */ updateBlog)
router.delete("/:id", protect, adminOnly, /* #swagger.tags = ['Blogs'] */ deleteBlog)

export default router
