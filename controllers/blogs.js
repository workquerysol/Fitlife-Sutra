import Blog from "../models/blogs.js"

export const createBlog = async (req, res) => {
    try {
        const { title, content, author, tags, status, category, description, image, featured, slug } = req.body
        if (!title || !content) {
            return res.status(400).json({ success: false, error: "Title and content are required" })
        }

        // Generate clean and unique slug
        let slugVal = slug;
        if (!slugVal) {
            let baseSlug = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
            if (!baseSlug) baseSlug = 'post';
            
            slugVal = baseSlug;
            while (await Blog.findOne({ slug: slugVal })) {
                slugVal = `${baseSlug}-${Math.floor(Math.random() * 10000)}`;
            }
        } else {
            let baseSlug = slugVal
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
            if (!baseSlug) baseSlug = 'post';
            
            slugVal = baseSlug;
            while (await Blog.findOne({ slug: slugVal })) {
                slugVal = `${baseSlug}-${Math.floor(Math.random() * 10000)}`;
            }
        }

        const blogData = {
            title,
            content,
            author,
            tags: tags || [],
            status: status || "DRAFT",
            category,
            description,
            image,
            featured: featured || false,
            slug: slugVal
        };

        if (blogData.status === "PUBLISHED") {
            blogData.publishedAt = new Date();
        }

        const blog = await Blog.create(blogData)

        return res.status(201).json({ success: true, data: blog })
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message })
    }
}

export const getBlogs = async (req, res) => {
    try {
        const { search, category, featured, status } = req.query;
        
        const filter = {};

        // Status Filter
        if (status) {
            filter.status = status;
        }

        // Category Filter
        if (category) {
            filter.category = category;
        }

        // Featured Filter
        if (featured !== undefined) {
            filter.featured = featured === 'true';
        }

        // Search Filter (matches title, description, content, or tags)
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            filter.$or = [
                { title: searchRegex },
                { description: searchRegex },
                { content: searchRegex },
                { tags: searchRegex }
            ];
        }

        // Sort by publishedAt if available, otherwise createdAt, descending
        const blogs = await Blog.find(filter).sort({ publishedAt: -1, createdAt: -1 });
        
        return res.status(200).json({ success: true, count: blogs.length, data: blogs });
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
        const { title, content, author, tags, status, category, description, image, featured, slug } = req.body
        
        const existingBlog = await Blog.findById(req.params.id)
        if (!existingBlog) {
            return res.status(404).json({ success: false, error: "Blog not found" });
        }

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (author !== undefined) updateData.author = author;
        if (tags !== undefined) updateData.tags = tags;
        if (status !== undefined) updateData.status = status;
        if (category !== undefined) updateData.category = category;
        if (description !== undefined) updateData.description = description;
        if (image !== undefined) updateData.image = image;
        if (featured !== undefined) updateData.featured = featured;

        // Transition from DRAFT to PUBLISHED
        if (status === "PUBLISHED" && existingBlog.status !== "PUBLISHED" && !existingBlog.publishedAt) {
            updateData.publishedAt = new Date();
        }

        // Handle Slug update/generation
        if (slug) {
            let cleanSlug = slug
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
            
            const duplicate = await Blog.findOne({ slug: cleanSlug, _id: { $ne: req.params.id } });
            if (duplicate) {
                cleanSlug = `${cleanSlug}-${Math.floor(Math.random() * 10000)}`;
            }
            updateData.slug = cleanSlug;
        } else if (title && title !== existingBlog.title) {
            let slugVal = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
            
            if (!slugVal) slugVal = 'post';

            let cleanSlug = slugVal;
            while (await Blog.findOne({ slug: cleanSlug, _id: { $ne: req.params.id } })) {
                cleanSlug = `${slugVal}-${Math.floor(Math.random() * 10000)}`;
            }
            updateData.slug = cleanSlug;
        }

        const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });
        
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