const path = require('path');
const fs = require('fs');

// Upload image (local storage)
exports.uploadImage = async (req, res) => {
    try {
        if (!req.files || !req.files.image) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        const image = req.files.image;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(image.mimetype)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed'
            });
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (image.size > maxSize) {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 5MB'
            });
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const ext = path.extname(image.name);
        const filename = `blog-${timestamp}${ext}`;
        const filepath = path.join(uploadsDir, filename);

        // Move file to uploads directory
        await image.mv(filepath);

        // Return the URL
        const imageUrl = `/uploads/${filename}`;

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                url: imageUrl,
                filename: filename
            }
        });
    } catch (error) {
        console.error('Upload image error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading image',
            error: error.message
        });
    }
};

// Delete image
exports.deleteImage = async (req, res) => {
    try {
        const { filename } = req.params;

        const filepath = path.join(__dirname, '../uploads', filename);

        // Check if file exists
        if (!fs.existsSync(filepath)) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        // Delete file
        fs.unlinkSync(filepath);

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully'
        });
    } catch (error) {
        console.error('Delete image error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting image',
            error: error.message
        });
    }
};
