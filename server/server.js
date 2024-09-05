const express = require('express');
const app = express();
let routes = {
    status: require('./routes/r-status'),
    files: require('./routes/r-files')
};

// Middleware per parsing JSON
app.use(express.json());

// Collegare le rotte al server
app.use('', routes.status);
app.use('/api', routes.files);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
