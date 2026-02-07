const Blog = require('../models/Blog');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Helper function to generate slug from title
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// Create a new blog
exports.createBlog = async (req, res) => {
    try {
        const { title, category, excerpt, content, featuredImage, author, status } = req.body;

        // Validate required fields
        if (!title || !category || !excerpt || !content || !author) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: title, category, excerpt, content, author'
            });
        }

        // Generate slug from title
        let slug = generateSlug(title);

        // Check if slug already exists, if so, append a number
        let slugExists = await Blog.findOne({ where: { slug } });
        let counter = 1;
        while (slugExists) {
            slug = `${generateSlug(title)}-${counter}`;
            slugExists = await Blog.findOne({ where: { slug } });
            counter++;
        }

        const blog = await Blog.create({
            title,
            slug,
            category,
            excerpt,
            content,
            featuredImage: featuredImage || null,
            author,
            status: status || 'draft'
        });

        res.status(201).json({
            success: true,
            message: 'Blog created successfully',
            data: blog
        });
    } catch (error) {
        console.error('Create blog error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating blog',
            error: error.message
        });
    }
};

// Get all published blogs (public)
exports.getPublishedBlogs = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', category = '' } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {
            status: 'published'
        };

        // Add search filter
        if (search) {
            whereClause[Op.or] = [
                { title: { [Op.iLike]: `%${search}%` } },
                { excerpt: { [Op.iLike]: `%${search}%` } },
                { content: { [Op.iLike]: `%${search}%` } }
            ];
        }

        // Add category filter
        if (category) {
            whereClause.category = category;
        }

        const { count, rows: blogs } = await Blog.findAndCountAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.status(200).json({
            success: true,
            data: blogs,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Get published blogs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching blogs',
            error: error.message
        });
    }
};

// Get all blogs (admin - includes drafts)
exports.getAllBlogs = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', category = '', status = '' } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};

        // Add search filter
        if (search) {
            whereClause[Op.or] = [
                { title: { [Op.iLike]: `%${search}%` } },
                { excerpt: { [Op.iLike]: `%${search}%` } },
                { author: { [Op.iLike]: `%${search}%` } }
            ];
        }

        // Add category filter
        if (category) {
            whereClause.category = category;
        }

        // Add status filter
        if (status) {
            whereClause.status = status;
        }

        const { count, rows: blogs } = await Blog.findAndCountAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.status(200).json({
            success: true,
            data: blogs,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Get all blogs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching blogs',
            error: error.message
        });
    }
};

// Get single blog by slug
exports.getBlogBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const blog = await Blog.findOne({
            where: { slug, status: 'published' }
        });

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        res.status(200).json({
            success: true,
            data: blog
        });
    } catch (error) {
        console.error('Get blog by slug error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching blog',
            error: error.message
        });
    }
};

// Update blog
exports.updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, excerpt, content, featuredImage, author, status } = req.body;

        const blog = await Blog.findByPk(id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        // If title is being updated, regenerate slug
        let slug = blog.slug;
        if (title && title !== blog.title) {
            slug = generateSlug(title);

            // Check if new slug already exists (excluding current blog)
            let slugExists = await Blog.findOne({
                where: {
                    slug,
                    id: { [Op.ne]: id }
                }
            });
            let counter = 1;
            while (slugExists) {
                slug = `${generateSlug(title)}-${counter}`;
                slugExists = await Blog.findOne({
                    where: {
                        slug,
                        id: { [Op.ne]: id }
                    }
                });
                counter++;
            }
        }

        await blog.update({
            title: title || blog.title,
            slug,
            category: category || blog.category,
            excerpt: excerpt || blog.excerpt,
            content: content || blog.content,
            featuredImage: featuredImage !== undefined ? featuredImage : blog.featuredImage,
            author: author || blog.author,
            status: status || blog.status
        });

        res.status(200).json({
            success: true,
            message: 'Blog updated successfully',
            data: blog
        });
    } catch (error) {
        console.error('Update blog error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating blog',
            error: error.message
        });
    }
};

// Delete blog
exports.deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;

        const blog = await Blog.findByPk(id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        await blog.destroy();

        res.status(200).json({
            success: true,
            message: 'Blog deleted successfully'
        });
    } catch (error) {
        console.error('Delete blog error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting blog',
            error: error.message
        });
    }
};

// Get all unique categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Blog.findAll({
            attributes: [[sequelize.fn('DISTINCT', sequelize.col('category')), 'category']],
            where: { status: 'published' },
            raw: true
        });

        res.status(200).json({
            success: true,
            data: categories.map(c => c.category)
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
};
