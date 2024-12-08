const fs = require('fs/promises');
const path = require('path');
const { getDownloadFolder, getDeletionMinutes } = require('./settings-config');

exports.checkAndDeleteFolders = async() => {
    const filePath = path.join(__dirname, '../settings/future_deletion.txt');
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        const lines = data.split('\n');
        const currentTime = new Date();
        const deletionMinutes = getDeletionMinutes();
        const downloadFolder = getDownloadFolder();
        const newLines = [];

        for (const line of lines) {
            if (!line.trim()) continue;
            const [folderName, dateStr, timeStr] = line.split('|');
            const [day, month, year] = dateStr.split('-').map(Number);
            const [hours, minutes] = timeStr.split(':').map(Number);
            const folderDateTime = new Date(year, month - 1, day, hours, minutes);
            const timeDifference = (currentTime - folderDateTime) / (1000 * 60);
            if (timeDifference > deletionMinutes) {
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
}