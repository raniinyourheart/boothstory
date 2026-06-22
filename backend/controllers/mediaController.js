const db = require('../config/database');
const fs = require('fs');
const path = require('path');

exports.uploadMedia = async (req, res) => {
    try {
        const { memoryId } = req.body;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const mediaData = files.map(file => {
            const fileType = file.mimetype.startsWith('video') ? 'video' : 'foto';
            const fileUrl = `http://localhost:5000/uploads/${file.filename}`;

            return [
                memoryId,
                file.originalname,
                fileUrl,
                fileType,
                file.size
            ];
        });

        await db.query(
            'INSERT INTO media (memory_id, file_name, file_url, file_type, file_size) VALUES ?',
            [mediaData]
        );

        res.json({ 
            message: 'Files uploaded successfully!',
            files: files.map(f => ({
                filename: f.filename,
                originalName: f.originalname,
                size: f.size
            }))
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteMedia = async (req, res) => {
    try {
        const { id } = req.params;

        // Get file path first
        const [media] = await db.query('SELECT file_url FROM media WHERE id = ?', [id]);
        
        if (media.length === 0) {
            return res.status(404).json({ message: 'Media not found' });
        }

        // Delete file from storage
        const filePath = path.join(__dirname, '..', media[0].file_url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete from database
        await db.query('DELETE FROM media WHERE id = ?', [id]);

        res.json({ message: 'Media deleted successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};