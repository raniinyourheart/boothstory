const db = require('../config/database');

// Get all memories with their media
exports.getAllMemories = async (req, res) => {
    try {
        const [memories] = await db.query(`
            SELECT 
                m.*,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', md.id,
                        'file_url', md.file_url,
                        'file_type', md.file_type,
                        'file_name', md.file_name
                    )
                ) as media
            FROM memories m
            LEFT JOIN media md ON m.id = md.memory_id
            GROUP BY m.id
            ORDER BY m.tanggal DESC
        `);

        res.json(memories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single memory with media
exports.getMemoryById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [memory] = await db.query(`
            SELECT 
                m.*,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', md.id,
                        'file_url', md.file_url,
                        'file_type', md.file_type,
                        'file_name', md.file_name
                    )
                ) as media
            FROM memories m
            LEFT JOIN media md ON m.id = md.memory_id
            WHERE m.id = ?
            GROUP BY m.id
        `, [id]);

        if (memory.length === 0) {
            return res.status(404).json({ message: 'Memory not found' });
        }

        res.json(memory[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new memory
exports.createMemory = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { tanggal, judul, deskripsi, lokasi, media } = req.body;

        // Insert memory
        const [result] = await connection.query(
            'INSERT INTO memories (tanggal, judul, deskripsi, lokasi) VALUES (?, ?, ?, ?)',
            [tanggal, judul, deskripsi, lokasi]
        );

        const memoryId = result.insertId;

        // Insert media if any
        if (media && media.length > 0) {
            const mediaValues = media.map(m => [
                memoryId,
                m.file_name,
                m.file_url,
                m.file_type,
                m.file_size
            ]);

            await connection.query(
                'INSERT INTO media (memory_id, file_name, file_url, file_type, file_size) VALUES ?',
                [mediaValues]
            );
        }

        await connection.commit();

        res.status(201).json({ 
            message: 'Memory created successfully!',
            id: memoryId 
        });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};

// Update memory
exports.updateMemory = async (req, res) => {
    try {
        const { id } = req.params;
        const { tanggal, judul, deskripsi, lokasi } = req.body;

        const [result] = await db.query(
            'UPDATE memories SET tanggal = ?, judul = ?, deskripsi = ?, lokasi = ? WHERE id = ?',
            [tanggal, judul, deskripsi, lokasi, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Memory not found' });
        }

        res.json({ message: 'Memory updated successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete memory (cascade will delete media)
exports.deleteMemory = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query('DELETE FROM memories WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Memory not found' });
        }

        res.json({ message: 'Memory deleted successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};