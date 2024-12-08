const fs = require('fs/promises');

let accounts = [];
let downloadFolder = undefined;
let actualIndex = undefined;
let future_deletion_minutes = undefined;

async function loadSettings(config_path, future_deletion_path) {
    let data = await fs.readFile(config_path, 'utf-8');
    try {
        await fs.access(future_deletion_path);
    } catch {
        await fs.writeFile(future_deletion_path, '', 'utf8');
    }
    data = JSON.parse(data);
    accounts = data.accounts;
    downloadFolder = data.download_folder;
    actualIndex = data.active_account_index;
    if (accounts == undefined || accounts.length == 0) throw new Error('PRE > Accounts not declared, please read the configuration guide to start the server');
    if (actualIndex == undefined) throw new Error('PRE > Active account not declared, please read the configuration guide to start the server');
    else actualIndex--;
    if (actualIndex < 0 || actualIndex >= accounts.length) throw new Error('PRE > Invalid active account index, please read the configuration guide to start the server');
    if (downloadFolder == undefined) throw new Error('PRE > Download folder not declared, please read the configuration guide to start the server');
    if (data.future_deletion_minutes == undefined) future_deletion_minutes = 5;
    else future_deletion_minutes = parseInt(data.future_deletion_minutes);
    const labels = new Set();
    const bot_tokens = new Set();
    const chat_ids = new Set();
    const databaseUrls = new Set();
    accounts.forEach((account, index) => {
        const { label, bot_token, chat_id, database_url } = account;
        if (!label) throw new Error(`PRE > Account n.${index + 1} is missing "label" attribute, please read the configuration guide to start the server`);
        if (!bot_token) throw new Error(`PRE > Account n.${index + 1} is missing "bot_token" attribute, please read the configuration guide to start the server`);
        if (!chat_id) throw new Error(`PRE > Account n.${index + 1} is missing "chat_id" attribute, please read the configuration guide to start the server`);
        if (!database_url) throw new Error(`PRE > Account n.${index + 1} is missing "database_url" attribute, please read the configuration guide to start the server`);
        if (labels.has(label)) throw new Error(`PRE > Found the same label for multiple accounts, that must be unique. Please read the configuration guide to start the server`);
        if (bot_tokens.has(bot_token)) throw new Error(`PRE > Found the same bot token for multiple accounts, that must be unique. Please read the configuration guide to start the server`);
        if (chat_ids.has(chat_id)) throw new Error(`PRE > Found the same archive chat ID for multiple accounts, that must be unique. Please read the configuration guide to start the server`);
        if (databaseUrls.has(database_url)) throw new Error(`PRE > Found the same database URL for multiple accounts, that must be unique. Please read the configuration guide to start the server`);
        labels.add(label);
        bot_tokens.add(bot_token);
        chat_ids.add(chat_id);
        databaseUrls.add(database_url);
    });
}

function getDeletionMinutes() {
    return future_deletion_minutes;
}

function getDownloadFolder() {
    return downloadFolder;
}

function getActualAccount() {
    return actualIndex + 1;
}

function getAccountLabel() {
    doesAccountExists(actualIndex);
    return accounts[actualIndex].label;
}

function getAccountsNumber() {
    return accounts.length;
}

function doesAccountExists() {
    if (actualIndex >= getAccountsNumber()|| actualIndex < 0) throw new Error('This account does not exists'); 
}

function getBotToken() {
    doesAccountExists(actualIndex);
    return accounts[actualIndex].bot_token;
}

function getChatId() {
    doesAccountExists(actualIndex);
    return accounts[actualIndex].chat_id;
}

function getDatabaseUrl() {
    doesAccountExists(actualIndex);
    return accounts[actualIndex].database_url;
}

module.exports = {
    loadSettings,
    getActualAccount,
    getAccountLabel,
    getAccountsNumber,
    getDownloadFolder,
    getAccountsNumber,
    getBotToken,
    getChatId,
    getDatabaseUrl,
    getDeletionMinutes
};
