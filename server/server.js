const express = require('express');
const app = express();
let routes = {
    status: require('./routes/r-status'),
    files: require('./routes/r-files'),
    folders: require('./routes/r-folders')
};

// Middleware per parsing JSON
app.use(express.json());

// Collegare le rotte al server
app.use('/api/status', routes.status);
app.use('/api/file', routes.files);
app.use('/api/folder', routes.folders);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
