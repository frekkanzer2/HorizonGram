const CONST = require('../utils/const');
const ChunkData = require('../dtos/ChunkData'); 
const errorFiles = require('../utils/error-files');
const chunkManagement = require('../utils/chunks-management')
const sizes = require('../utils/sizes')
const path = require('path');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

exports.upload = async (req, res) => {
    // Controlla se il file è stato caricato
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    if (!req.body.folder) return res.status(400).json({ message: 'No folder specified' });
    const file = req.file;
    const folder = req.body.folder;
    if (file.originalname.includes("-$") || file.originalname.includes("xDOTx"))
        return res.status(400).json({ message: 'File name not valid' });
    file.originalname = file.originalname.replace('.', 'xDOTx');

    
    if ((await axios.get(`${process.env.REALTIME_DATABASE_URL}ffolder_names/${folder}.json`)).data == null) {
        res.status(400).json({
            message: 'Folder does not exists',
        });
        return;
    }
    if ((await axios.get(`${process.env.REALTIME_DATABASE_URL}ffolder_names/${folder}/${file.originalname}.json`)).data != null) {
        res.status(400).json({
            message: 'File already exists',
        });
        return;
    }

    console.log(`UPL > Uploading "${file.originalname.replace('xDOTx', '.')}" | ${sizes.bytesToSize(file.size)}`);

    const databaseResponse = await axios.get(`${process.env.REALTIME_DATABASE_URL}${folder}.json`);
    const topic = databaseResponse.data.id;

    try {
        if (file.size <= CONST.MAX_CHUNK_SIZE){
            await axios.patch(`${process.env.REALTIME_DATABASE_URL}ffolder_names/${folder}.json`, {
                [file.originalname]: 1
            });
            await chunkManagement.send(new ChunkData(file.originalname, file.buffer), topic, folder);
        } 
        else {
            let chunks = chunkManagement.split(file.buffer, file.originalname, file.size);
            console.log(`UPL > File splitted in ${chunks.length} chunks`)
            await axios.patch(`${process.env.REALTIME_DATABASE_URL}ffolder_names/${folder}.json`, {
                [file.originalname]: chunks.length
            });
            for (let i = 0; i < chunks.length; i++) {
                await chunkManagement.send(chunks[i], topic, folder);
            }
        }
    } catch (error) {
        errorFiles.PrintUploadError(error);
        res.status(500).json({ message: 'Error sending file to Telegram' });
    }
    res.status(200).json({
        message: 'File successfully uploaded and sent to Telegram'
    });
};

exports.deleteFile = async (req, res) => {
    if (!req.body.folder) return res.status(400).json({ message: 'No folder specified' });
    if (!req.body.filename) return res.status(400).json({ message: 'No file name specified' });
    let folder = req.body.folder;
    let filename = req.body.filename;
    if (filename.includes("-$") || filename.includes("xDOTx"))
        return res.status(400).json({ message: 'File name not valid' });
    filename = filename.replace('.', 'xDOTx');
    if ((await axios.get(`${process.env.REALTIME_DATABASE_URL}ffolder_names/${folder}/${filename}.json`)).data == null) {
        res.status(400).json({
            message: 'Folder or file does not exists',
        });
        return;
    }
    let filedataRes = (await axios.get(`${process.env.REALTIME_DATABASE_URL}${folder}/content/${filename}.json`)).data;
    const idsToDelete = filedataRes.slice(1).map(item => item.msgid);
    for (let i=1; i < filedataRes.length; i++)
        axios.delete(`${process.env.REALTIME_DATABASE_URL}${folder}/content/${filename}/${i}.json`);
    axios.delete(`${process.env.REALTIME_DATABASE_URL}ffolder_names/${folder}/${filename}.json`);
    await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/deleteMessages`, {
        chat_id: process.env.ARCHIVE_CHATID,
        message_ids: idsToDelete
    });
    
    console.log(`DEL > File "${filename.replace('xDOTx', '.')}" deleted`);
    res.status(200).json({
        message: 'File successfully deleted'
    });
}

exports.integrity_check = async (req, res) => {
    if (!req.body.folder) return res.status(400).json({ message: 'No folder specified' });
    if (!req.body.filename) return res.status(400).json({ message: 'No file name specified' });
    const folder = req.body.folder;
    let filename = req.body.filename;
    if (filename.includes("-$") || filename.includes("xDOTx"))
        return res.status(400).json({ message: 'File name not valid' });
    filename = filename.replace('.', 'xDOTx');
    let filedataRes = (await axios.get(`${process.env.REALTIME_DATABASE_URL}${folder}/content/${filename}.json`)).data;
    let chunksNumber = (await axios.get(`${process.env.REALTIME_DATABASE_URL}ffolder_names/${folder}/${filename}.json`)).data;
    if (Array.isArray(filedataRes) && (chunksNumber != null && chunksNumber == filedataRes.length-1))
        return res.status(200).json();
    else return res.status(400).json();
}

exports.integrity_check_explicit = async (raw_folder, raw_filename) => {
    const folder = raw_folder;
    let filename = raw_filename;
    let filedataRes = (await axios.get(`${process.env.REALTIME_DATABASE_URL}${folder}/content/${filename}.json`)).data;
    let chunksNumber = (await axios.get(`${process.env.REALTIME_DATABASE_URL}ffolder_names/${folder}/${filename}.json`)).data;
    return (Array.isArray(filedataRes) && (chunksNumber != null && chunksNumber == filedataRes.length-1));
}

exports.delete_corrupted_file_explicit = async (raw_folder, raw_filename) => {
    let folder = raw_folder;
    let filename = raw_filename;
    filename = filename.replace('.', 'xDOTx');
    try {
        let filedataRes = (await axios.get(`${process.env.REALTIME_DATABASE_URL}${folder}/content/${filename}.json`)).data;
        filedataRes = Object.values(filedataRes);
        filedataRes = filedataRes.filter(element => element !== null);
        const idsToDelete = filedataRes.map(item => item.msgid);
        try {
            await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/deleteMessages`, {
                chat_id: process.env.ARCHIVE_CHATID,
                message_ids: idsToDelete
            });
        } catch (err) {
            console.log(`PRE > ERR::${err.code} > Cannot delete "${raw_filename}" data on Telegram`);
        }
    }
    catch (err) { }
    await axios.delete(`${process.env.REALTIME_DATABASE_URL}${folder}/content/${filename}.json`);
    await axios.delete(`${process.env.REALTIME_DATABASE_URL}ffolder_names/${folder}/${filename}.json`);
}

exports.download = async (req, res) => {
    if (!req.body.folder) return res.status(400).json({ message: 'No folder specified' });
    if (!req.body.filename) return res.status(400).json({ message: 'No file name specified' });
    const folder = req.body.folder;
    let filename = req.body.filename;

    if (filename.includes("-$") || filename.includes("xDOTx"))
        return res.status(400).json({ message: 'File name not valid' });
    filename = filename.replace('.', 'xDOTx');

    let chunksNumber = (await axios.get(`${process.env.REALTIME_DATABASE_URL}ffolder_names/${folder}/${filename}.json`)).data;
    if (chunksNumber == null) {
        res.status(400).json({
            message: 'Folder or file does not exist',
        });
        return;
    }
    console.log(`DWN > The following file will be downloaded in ${chunksNumber} chunks: "${filename.replace('xDOTx', '.')}"`);

    const chunksToDownload = (await axios.get(`${process.env.REALTIME_DATABASE_URL}${folder}/content/${filename}.json`)).data;
    if (chunksNumber != chunksToDownload.length - 1) {
        console.log("DWN > File corrupted, download aborted")
        res.status(400).json({
            message: 'File corrupted. Delete the file or restart the server.'
        });
        return;
    }

    const dirPath = "../downloads/"
    if (!fs.existsSync(dirPath)){
        fs.mkdirSync(dirPath);
    }
    const tempFilePath = path.join(dirPath, `${filename}-temp`);

    try {
        const writeStream = fs.createWriteStream(tempFilePath);
        // Scarica ogni chunk e salvalo su disco
        for (let i = 1; i <= chunksNumber; i++) {
            const chunkName = `${filename}-$[${i}]`;
            const fileId = chunksToDownload[i].fileid;
            console.log(`DWN > Downloading "${filename.replace('xDOTx', '.')}" | Chunk: ${i}`);
            const chunkBuffer = await chunkManagement.fetch(fileId);
            writeStream.write(chunkBuffer);
        }
        writeStream.end();
        const downloadFolder = (process.env.DOWNLOAD_FOLDER_PATH.endsWith('\\') || process.env.DOWNLOAD_FOLDER_PATH.endsWith('/'))
            ? process.env.DOWNLOAD_FOLDER_PATH + `${folder}\\`: process.env.DOWNLOAD_FOLDER_PATH + `\\${folder}\\`;
        if (!fs.existsSync(downloadFolder)) {
            fs.mkdirSync(downloadFolder);
        }
        const completeFilePath = path.join(downloadFolder, filename.replace('xDOTx', '.'));
        fs.renameSync(tempFilePath, completeFilePath);
        console.log(`DWN > File saved in: "${completeFilePath}"`);
        if (fs.existsSync(dirPath)) {
            fs.rmdirSync(dirPath, { recursive: true });
        }
        return res.status(200).json({ downloadPath: completeFilePath });
    } catch (error) {
        console.error('DWN > Error:', error);
        if (fs.existsSync(dirPath)) {
            fs.rmdirSync(dirPath, { recursive: true });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};