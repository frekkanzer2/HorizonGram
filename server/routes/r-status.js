const express = require('express');
const router = express.Router();
const controller = require('../controllers/c-status');

// Definizione delle rotte
router.get('/status', controller.getStatus);

module.exports = router;
