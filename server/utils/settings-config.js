const fs = require('fs/promises');

let accounts = [];
let downloadFolder = undefined;
let actualIndex = undefined;

async function loadSettings(path) {
    let data = await fs.readFile(path, 'utf-8');
    data = JSON.parse(data);
    accounts = data.accounts;
    downloadFolder = data.download_folder;
    actualIndex = data.active_account_index;
    if (accounts == undefined || accounts.length == 0) throw new Error('PRE > Accounts not declared, please read the configuration guide to start the server');
    if (actualIndex == undefined) throw new Error('PRE > Active account not declared, please read the configuration guide to start the server');
    else actualIndex--;
    if (actualIndex < 0 || actualIndex >= accounts.length) throw new Error('PRE > Invalid active account index, please read the configuration guide to start the server');
    if (downloadFolder == undefined) throw new Error('PRE > Download folder not declared, please read the configuration guide to start the server');
    accounts.forEach((account, index) => {
        const { label, bot_token, chat_id, database_url } = account;
        if (!label) throw new Error(`PRE > Account n.${index + 1} is missing "label" attribute, please read the configuration guide to start the server`);
        if (!bot_token) throw new Error(`PRE > Account n.${index + 1} is missing "bot_token" attribute, please read the configuration guide to start the server`);
        if (!chat_id) throw new Error(`PRE > Account n.${index + 1} is missing "chat_id" attribute, please read the configuration guide to start the server`);
        if (!database_url) throw new Error(`PRE > Account n.${index + 1} is missing "database_url" attribute, please read the configuration guide to start the server`);
    });
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
    getDatabaseUrl
};
