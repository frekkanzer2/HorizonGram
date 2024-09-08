const express = require('express');
const router = express.Router();
const controller = require('../controllers/c-folders');

// Definizione delle rotte
router.post('/', controller.createTopic);
router.get('/', controller.getFileList);

module.exports = router;
