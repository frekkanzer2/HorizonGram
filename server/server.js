const express = require('express');
const app = express();
const cors = require('cors');

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
app.listen(PORT, () => {
    console.log(`HorizonGram Server started`);
});
