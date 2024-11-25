require('dotenv').config();
const axios = require('axios');
const { getDatabaseUrl, getBotToken, getChatId } = require('../utils/settings-config');

exports.createTopic = async (req, res) => {
    const body = req.body;
    if (!body.name) return res.status(400).json({ message: 'No folder name specified' });

    if ((await axios.get(`${getDatabaseUrl()}ffolder_names/${body.name}.json`)).data != null) {
        res.status(400).json({
            message: 'Folder name already exists',
        });
        return;
    }

    const topicCreationEndpoint = `https://api.telegram.org/bot${getBotToken()}/createForumTopic`;
    let telegramResponse = await axios.post(topicCreationEndpoint, {
        chat_id: getChatId(),
        name: body.name
    });
    telegramResponse = {
        message: 'Folder successfully created',
        id: telegramResponse.data.result.message_thread_id,
        name: telegramResponse.data.result.name
    };
    const databaseEndpoint = `${getDatabaseUrl()}${telegramResponse.name}.json`;
    await axios.put(databaseEndpoint, {
        id: telegramResponse.id
    });
    await axios.patch(`${getDatabaseUrl()}ffolder_names.json`, {
        [body.name]: {
            xDOTx: 0
        }
    });

    console.log(`FOL > Created folder \"${telegramResponse.name}\" with ID ${telegramResponse.id}`);

    res.status(200).json(telegramResponse);
};

exports.getFileList = async (req, res) => {
    let databaseResponse = await axios.get(`${getDatabaseUrl()}ffolder_names.json`);
    for (const key in databaseResponse.data) if (databaseResponse.data[key].hasOwnProperty('xDOTx')) delete databaseResponse.data[key]['xDOTx'];
    res.status(200).json({
        data: databaseResponse.data
    });
}

exports.getFileList_explicit = async () => {
    let databaseResponse = await axios.get(`${getDatabaseUrl()}ffolder_names.json`);
    for (const key in databaseResponse.data) if (databaseResponse.data[key].hasOwnProperty('xDOTx')) delete databaseResponse.data[key]['xDOTx'];
    return databaseResponse.data;
}

exports.deleteTopic = async (req, res) => {
    const body = req.body;
    if (!body.name) return res.status(400).json({ message: 'No folder name specified' });
    const filesInFolder = (await axios.get(`${getDatabaseUrl()}ffolder_names/${body.name}.json`)).data;
    if (Object.keys(filesInFolder).length > 1) {
        res.status(400).json({
            message: `Folder has ${Object.keys(filesInFolder).length - 1} file${(Object.keys(filesInFolder).length > 2) ? "s" : ""}. Please delete all files within it.`,
        });
        return;
    }
    const thread_id = await axios.get(`${getDatabaseUrl()}/${body.name}/id.json`);
    const topicDeletionEndpoint = `https://api.telegram.org/bot${getBotToken()}/deleteForumTopic`;
    await axios.post(topicDeletionEndpoint, {
        chat_id: getChatId(),
        message_thread_id: thread_id.data
    });
    await axios.delete(`${getDatabaseUrl()}ffolder_names/${body.name}.json`)
    await axios.delete(`${getDatabaseUrl()}${body.name}.json`)
    console.log(`FOL > Deleted folder \"${body.name}\"`);
    res.status(200).json({message: "Folder deleted successfully"});
}