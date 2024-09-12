const express = require('express');
const router = express.Router();
const multer = require('multer');
const controller = require('../controllers/c-chunks');
const CONST = require('../utils/const');

const direct_api_upload_settings = multer({
  //limits: { fileSize: CONST.MAX_CHUNK_SIZE+1 },
  storage: multer.memoryStorage() 
});

// Definizione delle rotte
router.post('/upload/checks', controller.upload_checks);
router.post('/upload/preparation', controller.upload_preparation);
router.post('/upload', direct_api_upload_settings.single('file'), controller.upload);

module.exports = router;