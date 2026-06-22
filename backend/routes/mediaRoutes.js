const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mediaController = require('../controllers/mediaController');

// Konfigurasi multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only images and videos are allowed!'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
    fileFilter: fileFilter
});

router.post('/upload', upload.array('files', 10), mediaController.uploadMedia);
router.delete('/:id', mediaController.deleteMedia);

module.exports = router;