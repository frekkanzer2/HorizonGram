require('dotenv').config();
const CONST = require('../utils/const');
const ChunkData = require('../dtos/ChunkData'); 
const FormData = require('form-data');
const axios = require('axios');

/// INPUT
// - chunkData type of ChunkData
/// OUTPUT
// - none
exports.send = async (chunkData) => {
    if (!(chunkData instanceof ChunkData))
        throw new TypeError("Variable chunkData is not of type ChunkData");

    const fileUploadEndpoint = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendDocument`;
    const form = new FormData();
    form.append('chat_id', process.env.ARCHIVE_CHATID);
    form.append('document', chunkData.buffer, chunkData.name);
    form.append('caption', chunkData.name);
    const headers = form.getHeaders();

    console.log(`Uploading chunk ${chunkData.name}`)
    await axios.post(fileUploadEndpoint, form, { headers });
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