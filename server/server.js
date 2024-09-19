const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');  // Modulo per eseguire comandi di sistema
const os = require('os');  // Per rilevare il sistema operativo

let routes = {
    status: require('./routes/r-status'),
    files: require('./routes/r-files'),
    folders: require('./routes/r-folders'),
    chunks: require('./routes/r-chunks')
};

app.use(cors());
app.use(express.json());

app.use('/api/status', routes.status);
app.use('/api/file', routes.files);
app.use('/api/folder', routes.folders);
app.use('/api/chunks', routes.chunks);

function open_client() {
    let url = path.join(__dirname, './../client/index.html');
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
                console.error('Errore nell\'apertura del browser\n', err);
            }
        });
    }
}

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`HorizonGram Server started`);
    open_client();
});
