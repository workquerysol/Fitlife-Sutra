import Blog from "../models/blogs.js"

export const createBlog = async (req, res) => {
    try {
        const { title, content, author, tags, status } = req.body
        if (!title || !content) {
            return res.status(400).json({ success: false, error: "Title and content are required" })
        }

        const blog = await Blog.create({
            title,
            content,
            author,
            tags,
            status
        })

        return res.status(201).json({ success: true, data: blog })
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message })
    }
}

export const getBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find();
        return res.status(200).json({ success: true, data: blogs });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

export const getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ success: false, error: "Blog not found" });
        }
        return res.status(200).json({ success: true, data: blog });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

export const updateBlog = async (req, res) => {
    try {
        const { title, content, author, tags, status } = req.body
        const blog = await Blog.findByIdAndUpdate(req.params.id, {
            title,
            content,
            author,
            tags,
            status
        }, { new: true });
        if (!blog) {
            return res.status(404).json({ success: false, error: "Blog not found" });
        }
        return res.status(200).json({ success: true, data: blog });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

export const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) {
            return res.status(404).json({ success: false, error: "Blog not found" });
        }
        return res.status(200).json({ success: true, data: blog });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}