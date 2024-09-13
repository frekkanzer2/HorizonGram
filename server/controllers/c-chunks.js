const CONST = require('../utils/const');
const ChunkData = require('../dtos/ChunkData'); 
const errorFiles = require('../utils/error-files');
const chunkManagement = require('../utils/chunks-management')
const sizes = require('../utils/sizes')
const axios = require('axios');
require('dotenv').config();

exports.upload_checks = async (req, res) => {
    if (!req.body.filename) return res.status(400).json({ message: 'No file name specified' });
    if (!req.body.folder) return res.status(400).json({ message: 'No folder specified' });
    let filename = req.body.filename;
    const folder = req.body.folder;
    if (filename.includes("-$") || filename.includes("xDOTx"))
        return res.status(400).json({ message: 'File name not valid' });
    const occurrences = filename.match(/\./g);  // Cerca tutte le occorrenze di '.'
    if (occurrences && occurrences.length > 1) filename = filename.replace(/\.(?=.*\.)/g, '-');

    filename = filename.replace('.', 'xDOTx');
    try {
        console.log("Started checks for chunk upload");
        if ((await axios.get(`${process.env.REALTIME_DATABASE_URL}ffolder_names/${folder}.json`)).data == null) {
            console.log("Folder does not exists");
            res.status(400).json({
                message: 'Folder does not exists',
            });
            return;
        }
        if ((await axios.get(`${process.env.REALTIME_DATABASE_URL}ffolder_names/${folder}/${filename}.json`)).data != null) {
            console.log("File already exists");
            res.status(400).json({
                message: 'File already exists',
            });
            return;
        }
    } catch (error) {
        errorFiles.PrintUploadError(error);
        res.status(500).json({ message: 'Error sending file to Telegram' });
        return;
    }
    console.log("Everything is okay");
    res.status(200).json({
        message: 'Checks are OK'
    });
}

exports.upload_preparation = async (req, res) => {
    if (!req.body.filename) return res.status(400).json({ message: 'No file name specified' });
    if (!req.body.folder) return res.status(400).json({ message: 'No folder specified' });
    if (!req.body.totalChunks) return res.status(400).json({ message: 'No total number of chunks specified' });
    const folder = req.body.folder;
    const occurrences = req.body.filename.match(/\./g);  // Cerca tutte le occorrenze di '.'
    console.log("Preparation started for chunk");
    if (occurrences && occurrences.length > 1) {
        req.body.filename = req.body.filename.replace(/\.(?=.*\.)/g, '-');
        console.log("Filename contains multiple dots, replacing them with \'-\'")
    }
    req.body.filename = req.body.filename.replace('.', 'xDOTx');
    try {
        await axios.patch(`${process.env.REALTIME_DATABASE_URL}ffolder_names/${folder}.json`, {
            [req.body.filename]: req.body.totalChunks
        });
    } catch (error) {
        errorFiles.PrintUploadError(error);
        res.status(500).json({ message: 'Error sending file to Telegram' });
        return;
    }
    console.log("Preparation ended");
    res.status(200).json({
        message: 'Registration completed'
    });
}

exports.upload = async (req, res) => {
    // Controlla se il file è stato caricato
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    if (!req.body.folder) return res.status(400).json({ message: 'No folder specified' });
    if (!req.body.chunkno) return res.status(400).json({ message: 'No chunk number specified' });
    try {
        const file = req.file;
        const folder = req.body.folder;
        const chunk_number = req.body.chunkno;
        const occurrences = file.originalname.match(/\./g);  // Cerca tutte le occorrenze di '.'
        if (occurrences && occurrences.length > 1) file.originalname = file.originalname.replace(/\.(?=.*\.)/g, '-');
        file.originalname = file.originalname.replace('.', 'xDOTx');
        console.log(`Upload of: \"${file.originalname}\" | Chunk: ${chunk_number} | ${sizes.bytesToSize(file.size)}`);
        const databaseResponse = await axios.get(`${process.env.REALTIME_DATABASE_URL}${folder}.json`);
        const topic = databaseResponse.data.id;
        await chunkManagement.send(new ChunkData(`${file.originalname}-$[${chunk_number}]`, file.buffer), topic, folder);
    } catch (error) {
        errorFiles.PrintUploadError(error);
        return res.status(500).json({ message: 'Error sending file to Telegram' });
    }
    return res.status(200).json({
        message: 'File successfully uploaded and sent to Telegram'
    });
};