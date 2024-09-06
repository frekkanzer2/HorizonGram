const CryptoJS = require('crypto-js');

exports.encrypt = (string) => {
    let encrypted = CryptoJS.AES.encrypt(string, "Secret Passphrase");
    encrypted = CryptoJS.AES.decrypt(encrypted, "Secret Passphrase");
    return encrypted;
}
exports.decrypt = (encrypted) => encrypted.toString(CryptoJS.enc.Utf8);