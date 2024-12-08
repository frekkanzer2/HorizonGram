const VERSION = "2.0";
const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const engine = require('./utils/engine')
const { loadSettings, getAccountLabel } = require('./utils/settings-config');
const { checkAndDeleteFolders } = require('./utils/future-deletion');
const settings_path = './settings/config.json';
const temp_download_path = './settings/future_deletion.txt'

console.clear();
console.log(`======== HORIZONGRAM ${VERSION} ========`);
engine.settingsfile_exists(path.join(__dirname, settings_path));
loadSettings(settings_path, temp_download_path).then(() => {
    console.log(`====== Profile :: ${getAccountLabel()} ======`)
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

    const PORT = 3000;

    engine.integrity_checks().then(
        () => {
            setInterval(checkAndDeleteFolders, 60 * 1000);
            const server = app.listen(PORT, () => {
                console.log(`RUN > Server successfully started on http://localhost:${PORT}`);
                engine.open_client();
            });
            // Gestione degli errori
            server.on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    console.error(`RUN > ERR::${err.code} > Server already started`);
                    process.exit(1);
                } else {
                    console.error(`RUN > ERR::${err.code} > Error not managed\n${err.message}`);
                    process.exit(1);
                }
            });
        }
    ).catch((error) => {
        console.log("PRE > ERR > Integrity check failed")
        console.error(error);
        process.exit(1);
    });
})
.catch((error) => {
    console.error(error);
    process.exit(1);
});