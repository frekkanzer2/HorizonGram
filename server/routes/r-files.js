const express = require('express');
const router = express.Router();
const multer = require('multer');
const controller = require('../controllers/c-files');

const direct_api_upload_settings = multer({
  limits: { fileSize: 1073741824 },
  storage: multer.memoryStorage() 
});

// Definizione delle rotte
router.delete('/', controller.deleteFile);
router.post('/upload', direct_api_upload_settings.single('file'), controller.upload);
router.post('/download', controller.download);
router.post('/integrity', controller.integrity_check);
module.exports = router;