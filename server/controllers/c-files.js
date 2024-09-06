const CONST = require('../utils/const');
const ChunkData = require('../dtos/ChunkData'); 
const errorFiles = require('../utils/error-files');
const chunkManagement = require('../utils/chunks-management')
const sizes = require('../utils/sizes')
const axios = require('axios');
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

    console.log(`The following file will be uploaded: \"${file.originalname}\" | ${sizes.bytesToSize(file.size)}`);

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
            console.log(`File splitted in ${chunks.length} chunks`)
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

exports.getFileList = async (req, res) => {
    let databaseResponse = await axios.get(`${process.env.REALTIME_DATABASE_URL}ffolder_names.json`);
    for (const key in databaseResponse.data) if (databaseResponse.data[key].hasOwnProperty('xDOTx')) delete databaseResponse.data[key]['xDOTx'];
    res.status(200).json({
        data: databaseResponse.data
    });
}

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
    
    console.log(`File ${filename} deleted`);
    res.status(200).json({
        message: 'File successfully deleted'
    });
}