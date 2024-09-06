require('dotenv').config();
const idManager = require('../utils/numeric-encryption');
const axios = require('axios');
const errorFiles = require('../utils/error-files');

exports.createTopic = async (req, res) => {
    const body = req.body;
    if (!body.name) return res.status(400).json({ message: 'No folder name specified' });

    if ((await axios.get(`${process.env.REALTIME_DATABASE_URL}ffolder_names/${body.name}.json`)).data != null) {
        res.status(400).json({
            message: 'Folder name already exists',
        });
        return;
    }

    const topicCreationEndpoint = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/createForumTopic`;
    let telegramResponse = await axios.post(topicCreationEndpoint, {
        chat_id: process.env.ARCHIVE_CHATID,
        name: body.name
    });
    telegramResponse = {
        message: 'Folder successfully created',
        id: telegramResponse.data.result.message_thread_id,
        name: telegramResponse.data.result.name
    };
    const databaseEndpoint = `${process.env.REALTIME_DATABASE_URL}${telegramResponse.name}.json`;
    await axios.put(databaseEndpoint, {
        id: telegramResponse.id
    });
    await axios.patch(`${process.env.REALTIME_DATABASE_URL}ffolder_names.json`, {
        [body.name]: {
            xDOTx: 0
        }
    });

    console.log(`Created folder \"${telegramResponse.name}\" with ID ${telegramResponse.id}`);

    res.status(200).json(telegramResponse);
};