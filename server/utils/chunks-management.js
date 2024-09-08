require('dotenv').config();
const CONST = require('../utils/const');
const ChunkData = require('../dtos/ChunkData'); 
const FormData = require('form-data');
const axios = require('axios');

exports.fetch = async (chunkFileId) => {
    let filePath = (await axios.get(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/getFile?file_id=${chunkFileId}`)).data.result.file_path;
    const fileResponse = await axios.get(`https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${filePath}`, { responseType: 'arraybuffer' });
    return fileResponse.data;
}

/// INPUT
// - chunkData type of ChunkData
/// OUTPUT
// - none
exports.send = async (chunkData, topicId, topicName) => {
    if (!(chunkData instanceof ChunkData))
        throw new TypeError("Variable chunkData is not of type ChunkData");

    const fileUploadEndpoint = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendDocument`;
    const form = new FormData();
    form.append('chat_id', process.env.ARCHIVE_CHATID);
    form.append('document', chunkData.buffer, chunkData.name);
    form.append('caption', chunkData.name);
    form.append('message_thread_id', topicId);
    const headers = form.getHeaders();

    console.log(`Uploading chunk ${chunkData.name}`)
    let response = await axios.post(fileUploadEndpoint, form, { headers });
    let name_parts = response.data.result.caption.split('-$');
    await axios.put(`${process.env.REALTIME_DATABASE_URL}${topicName}/content/${name_parts[0]}/${name_parts.length == 2 ? name_parts[1].replace(/[\[\]]/g, '') : 1}.json`, {
        fileid: `${response.data.result.document.file_id}`,
        msgid: response.data.result.message_id
    });
    console.log(`Chunk ${chunkData.name} uploaded successfully.`);
}

/// INPUT
// - buffer type of string
// - size type of number
/// OUTPUT
// - array of ChunkData
exports.split = (buffer, name, size) => {
    let chunkCount = Math.ceil(size / CONST.MAX_CHUNK_SIZE);
    let chunks = [];
    for (let i = 0; i < chunkCount; i++) {
        let start = i * CONST.MAX_CHUNK_SIZE;
        let end = (i + 1) * CONST.MAX_CHUNK_SIZE;
        let chunkBuffer = buffer.slice(start, end);
        let chunkName = `${name}-$[${i + 1}]`;
        chunks.push(new ChunkData(chunkName, chunkBuffer));
    }
    return chunks;
}