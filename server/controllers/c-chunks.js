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
    const occurrences = filename.match(/\./g);  // Cerca tutte le occorrenze di '.'
    if (occurrences && occurrences.length > 1) filename = filename.replace(/\.(?=.*\.)/g, '-');
    const validFilenameRegex = /^[A-Za-z0-9 ._+\-&()]+\.?[A-Za-z0-9]{0,4}$/;
    if (filename.includes("-$") || filename.includes("xDOTx") || !validFilenameRegex.test(filename) || filename.length > 50) {
        let errMessage = "";
        if (filename.length > 50) errMessage = 'File name too long (50 chars limit)';
        else if (!validFilenameRegex.test(filename)) errMessage = 'Remove special characters from the file name';
        else errMessage = 'File name not valid';
        return res.status(400).json({ message: errMessage });
    }
    filename = filename.replace('.', 'xDOTx');
    try {
        if ((await axios.get(`${process.env.REALTIME_DATABASE_URL}ffolder_names/${folder}.json`)).data == null) {
            res.status(400).json({
                message: 'Folder does not exists',
            });
            return;
        }
        if ((await axios.get(`${process.env.REALTIME_DATABASE_URL}ffolder_names/${folder}/${filename}.json`)).data != null) {
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
    res.status(200).json({
        message: 'Checks are OK'
    });
}

exports.upload_preparation = async (req, res) => {
    if (!req.body.filename) return res.status(400).json({ message: 'No file name specified' });
    if (!req.body.folder) return res.status(400).json({ message: 'No folder specified' });
    if (!req.body.totalChunks) return res.status(400).json({ message: 'No total number of chunks specified' });
    const folder = req.body.folder;
    const occurrences = req.body.filename.match(/\./g);
    if (occurrences && occurrences.length > 1) {
        req.body.filename = req.body.filename.replace(/\.(?=.*\.)/g, '-');
        console.log("UPL > Filename contains multiple dots, replacing them with \'-\'")
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
    res.status(200).json({
        message: 'Registration completed'
    });
}

function getWaitingTime(attempt) {
    switch (attempt) {
        case 2:
            return 5;
        case 3:
            return 30;
        case 4:
            return 300;
        case 5:
            return 900;
    }
}

function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
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
        console.log(`UPL > Uploading "${file.originalname.replace('xDOTx', '.')}" | Chunk: ${chunk_number} | ${sizes.bytesToSize(file.size)}`);
        const maxRetries = 5; // Numero massimo di tentativi
        let attempt = 1;
        let databaseResponse;
        while (attempt < maxRetries) {
            try {
                databaseResponse = await axios.get(`${process.env.REALTIME_DATABASE_URL}${folder}.json`);
                if (databaseResponse && databaseResponse.data) break;
            } catch (error) {
                if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
                    attempt++;
                    console.log(`UPL > ERR::${error.code} > Catched when reading metadata for "${file.originalname.replace('xDOTx', '.')}" upload | Chunk: ${chunk_number}`);
                    if (attempt > maxRetries) {
                        console.error('UPL > Maximum number of attempts reached');
                        throw error;
                    } else {
                        console.log(`TIM > Waiting ${getWaitingTime(attempt)} seconds for a new reading metadata attempt of "${file.originalname.replace('xDOTx', '.')}" | Chunk: ${chunk_number}`);
                        await sleep(getWaitingTime(attempt));
                        console.log(`UPL > Executing new reading metadata attempt (${attempt}/${maxRetries}) for "${file.originalname.replace('xDOTx', '.')}" | Chunk: ${chunk_number}`);
                    }
                } else {
                    console.error(`UPL > ERR::${error.code} > Error not managed`);
                    throw error;
                }
            }
        }
        const topic = databaseResponse.data.id;
        attempt = 1; 
        while (attempt < maxRetries) {
            try {
                await chunkManagement.send(new ChunkData(`${file.originalname}-$[${chunk_number}]`, file.buffer), topic, folder);
                break;
            } catch (error) {
                attempt++;
                console.log(`UPL > ERR::${error.code} > Catched when uploading "${file.originalname.replace('xDOTx', '.')}" | Chunk: ${chunk_number}`);
                if (attempt > maxRetries) {
                    console.error('UPL > Maximum number of upload attempts reached');
                    throw error;
                } else {
                    console.log(`TIM > Waiting ${getWaitingTime(attempt)} seconds for a upload attempt of "${file.originalname.replace('xDOTx', '.')}" | Chunk: ${chunk_number}`);
                    await sleep(getWaitingTime(attempt));
                    console.error(`UPL > Executing new upload attempt (${attempt}/${maxRetries}) for "${file.originalname.replace('xDOTx', '.')}" | Chunk: ${chunk_number}`);
                }
            }
        }
        console.log(`UPL > "${file.originalname.replace('xDOTx', '.')}" | Chunk: ${chunk_number} successfully uploaded`);
    } catch (error) {
        errorFiles.PrintUploadError(error);
        return res.status(500).json({ message: 'Error sending file to Telegram' });
    }
    return res.status(200).json({
        message: 'File successfully uploaded and sent to Telegram'
    });
};