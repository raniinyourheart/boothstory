const express = require('express');
const router = express.Router();
const memoryController = require('../controllers/memoryController');

router.get('/', memoryController.getAllMemories);
router.get('/:id', memoryController.getMemoryById);
router.post('/', memoryController.createMemory);
router.put('/:id', memoryController.updateMemory);
router.delete('/:id', memoryController.deleteMemory);

module.exports = router;