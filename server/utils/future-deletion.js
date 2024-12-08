const fs = require('fs/promises');
const path = require('path');
const { getDownloadFolder, getDeletionMinutes } = require('./settings-config');
const filePath = path.join(__dirname, '../settings/future_deletion.txt');

exports.checkAndDeleteFolders = async () => {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        const lines = data.split('\n');
        const currentTime = new Date()
        const downloadFolder = getDownloadFolder();
        const newLines = [];

        for (const line of lines) {
            if (!line.trim()) continue;
            const [folderName, dateStr, timeStr] = line.split('|');
            const [day, month, year] = dateStr.split('-').map(Number);
            const [hours, minutes] = timeStr.split(':').map(Number);
            const folderDateTime = new Date(year, month - 1, day, hours, minutes);
            const timeDifference = (currentTime - folderDateTime) / (1000 * 60);

            if (timeDifference > 0) {
                const folderPath = path.join(downloadFolder, folderName);
                try {
                    await fs.rm(folderPath, { recursive: true, force: true });
                    console.log(`TIMDEL > Deleted folder ${folderPath}`);
                } catch (err) {
                    console.error(`ERR > Cannot delete folder ${folderPath}`);
                    throw err;
                }
            } else {
                newLines.push(line);
            }
        }

        const newContent = newLines.join('\n');
        await fs.writeFile(filePath, newContent, 'utf-8');
    } catch (error) {
        console.error('Cannot read \"future_deletion.txt\" file from \"settings\" folder');
    }
};

/**
 * Funzione per aggiungere o aggiornare un record di eliminazione programmata nel file future_deletion.txt.
 * @param {string} folderName - Nome della cartella da aggiungere o aggiornare.
 */
exports.addFolderToFutureDeletion = async (folderName) => {
    try {
        const deletionMinutes = getDeletionMinutes();
        const now = new Date();

        // Calcoliamo la nuova data di eliminazione con l'incremento di deletionMinutes
        const targetTime = new Date(now.getTime() + deletionMinutes * 60000);

        // Formatta la nuova data e ora
        const dateStr = `${targetTime.getDate().toString().padStart(2, '0')}-${(targetTime.getMonth() + 1).toString().padStart(2, '0')}-${targetTime.getFullYear()}`;
        const timeStr = `${targetTime.getHours().toString().padStart(2, '0')}:${targetTime.getMinutes().toString().padStart(2, '0')}`;

        // Leggi il contenuto esistente
        const data = await fs.readFile(filePath, 'utf-8');
        const lines = data.split('\n').filter(Boolean);

        let folderExists = false;
        const newLines = lines.map(line => {
            const [existingFolderName, , ] = line.split('|');
            if (existingFolderName === folderName) {
                folderExists = true;
                console.log(`TIMDEL > Folder "${folderName}" already exists, updating deletion time.`);
                return `${folderName}|${dateStr}|${timeStr}`;
            }
            return line;
        });

        if (!folderExists) newLines.push(`${folderName}|${dateStr}|${timeStr}`);

        const newContent = newLines.join('\n') + '\n';
        await fs.writeFile(filePath, newContent, 'utf-8');
        console.log(`TIMDEL > Folder "${folderName}" will be deleted at ${dateStr} ${timeStr}`);
    } catch (error) {
        console.error('Cannot edit \"future_deletion.txt\" file from \"settings\" folder');
    }
};
