const { exec } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');
const folder_controller = require('./../controllers/c-folders');
const file_controller = require('./../controllers/c-files');

exports.open_client = () => {
    let url = path.join(__dirname, './../../client/index.html');
    const platform = os.platform();
    let command;
    if (platform === 'win32') {
        command = `start ${url}`;
    } else if (platform === 'darwin') {
        command = `open ${url}`;
    } else if (platform === 'linux') {
        command = `xdg-open ${url}`;
    }
    if (command) {
        exec(command, (err) => {
            if (err) {
                console.error('Errore nell\'apertura del browser. Avviare manualmente il client.');
            }
        });
    }
}

exports.envfile_exists = (path) => {
    if (!fs.existsSync(path)) {
        console.error('PRE > Settings file (.env) not configured, please read the configuration guide to start the server');
        process.exit(1);
    } else console.log("PRE > \".env\" file found")
}

exports.integrity_checks = async () => {
    console.log("PRE > Integrity check of files managed by HorizonGram")
    let data = await folder_controller.getFileList_explicit();
    let corruptedFiles = [];
    for (const folderName in data) {
        console.log(`PRE > Integrity check on folder \"${folderName}\"`)
        const folderContents = data[folderName];
        for (const fileName in folderContents) {
            let success = await file_controller.integrity_check_explicit(folderName, fileName);
            if (!success) console.log(`PRE > File \"${folderName}/${fileName.replace('xDOTx', '.')}\" is corrupted`)
        }
    }
    console.log("PRE > Integrity check successfully ended")
}