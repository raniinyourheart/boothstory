const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const memoryRoutes = require('./routes/memoryRoutes');
const mediaRoutes = require('./routes/mediaRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/memories', memoryRoutes);
app.use('/api/media', mediaRoutes);

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
