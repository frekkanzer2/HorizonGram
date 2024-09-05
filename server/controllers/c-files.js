const CONST = require('../utils/const');
const ChunkData = require('../dtos/ChunkData'); 
const errorFiles = require('../utils/error-files');
const chunkManagement = require('../utils/chunks-management')
const sizes = require('../utils/sizes')
require('dotenv').config();

exports.upload = async (req, res) => {
    // Controlla se il file è stato caricato
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const file = req.file;
    if (file.originalname.includes("-$")) return res.status(400).json({ message: 'File name not valid' });
    console.log(`The following file will be uploaded: \"${file.originalname}\" | ${sizes.bytesToSize(file.size)}`);

    try {
        if (file.size <= CONST.MAX_CHUNK_SIZE) await chunkManagement.send(new ChunkData(file.originalname, file.buffer))
        else {
            let chunks = chunkManagement.split(file.buffer, file.originalname, file.size);
            console.log(`File splitted in ${chunks.length} chunks`)
            for (let i = 0; i < chunks.length; i++) {
                await chunkManagement.send(chunks[i]);
            }
        }
    res.status(200).json({
        message: 'File successfully uploaded and sent to Telegram'
    });
    } catch (error) {
        errorFiles.PrintUploadError(error);
        res.status(500).json({ message: 'Error sending file to Telegram' });
    }
};
