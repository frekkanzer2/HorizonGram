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
router.post('/download/list', controller.downloadList);
router.post('/download/url', controller.getDownloadUrl);

module.exports = router;