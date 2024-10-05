const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');
const fs = require('fs');

if (!fs.existsSync(path.join(__dirname, '.env'))) {
    console.error('Settings file (.env) not configured. Please read the configuration guide to start the server.');
    process.exit(1);
}

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
    console.log(`Server is running on http://localhost:${PORT}`);
    open_client();
});
