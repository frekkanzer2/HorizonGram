const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const engine = require('./utils/engine')

engine.envfile_exists(path.join(__dirname, '.env'));

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
        const server = app.listen(PORT, () => {
            console.log(`RUN > Server successfully started on http://localhost:${PORT}`);
            engine.open_client();
        });
        // Gestione degli errori
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`RUN > Server already started`);
                process.exit(1); // Uscita dal processo
            } else {
                console.error(`RUN > Generical server error: ${err.message}`);
            }
        });
    }
)