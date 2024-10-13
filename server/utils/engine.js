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
                console.error('RUN > Error during client startup, start it manually');
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
    let data = await folder_controller.getFileList_explicit();
    let corruptedFiles = [];
    for (const folderName in data) {
        console.log(`PRE > Integrity check of files in \"${folderName}\"`);
        const folderContents = data[folderName];
        // Prepara le promesse per tutti i file nella cartella
        const fileChecks = Object.keys(folderContents).map(async (fileName) => {
            let success = await file_controller.integrity_check_explicit(folderName, fileName);
            if (!success) {
                const fullFileName = `${folderName}/${fileName.replace('xDOTx', '.')}`;
                console.log(`PRE > File \"${fullFileName}\" is corrupted`);
                corruptedFiles.push(fullFileName); // Aggiungi alla lista se è corrotto
            }
        });
        // Attendi che tutte le promesse dei file della cartella siano completate
        await Promise.all(fileChecks);
    }
    for (const fullFileName of corruptedFiles) {
        const [folder, filename] = fullFileName.split('/');
        await file_controller.delete_corrupted_file_explicit(folder, filename);
        console.log(`PRE > Deleted corrupted file: \"${folder}/${filename}\"`);
    }
}