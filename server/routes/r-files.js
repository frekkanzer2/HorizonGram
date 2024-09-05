const express = require('express');
const router = express.Router();
const multer = require('multer');
const controller = require('../controllers/c-files');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Definizione delle rotte
router.post('/upload', upload.single('file'), controller.upload);

module.exports = router;