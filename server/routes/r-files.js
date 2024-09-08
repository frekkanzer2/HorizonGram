const express = require('express');
const router = express.Router();
const multer = require('multer');
const controller = require('../controllers/c-files');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Definizione delle rotte
router.get('/file', controller.getFileList);
router.delete('/file', controller.deleteFile);
router.post('/upload', upload.single('file'), controller.upload);
router.post('/download', controller.download);

module.exports = router;