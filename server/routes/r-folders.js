const express = require('express');
const router = express.Router();
const controller = require('../controllers/c-folders');

// Definizione delle rotte
router.post('/folder', controller.createTopic);

module.exports = router;
