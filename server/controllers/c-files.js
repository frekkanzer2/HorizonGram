const axios = require('axios');
const FormData = require('form-data'); // Importa FormData
require('dotenv').config();

exports.upload = async (req, res) => {
    // Controlla se il file è stato caricato
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.file;
    const fileUploadEndpoint = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendDocument`;

    console.log(`Received file \"${file.originalname}\" with dimension of ${file.size} bytes`);

    try {
        // Crea una nuova istanza di FormData
        const form = new FormData();
        form.append('chat_id', process.env.ARCHIVE_CHATID);
        form.append('document', file.buffer, file.originalname); // Aggiungi il file come buffer
        form.append('caption', file.originalname);

        const headers = form.getHeaders(); // Ottieni gli header per il multipart/form-data

        // Invia la richiesta POST con axios e FormData
        const telegramResponse = await axios.post(fileUploadEndpoint, form, { headers });

        res.status(200).json({
            message: 'File successfully uploaded and sent to Telegram',
            telegramData: telegramResponse.data,
        });
    } catch (error) {
        console.error(`File not uploaded, received error: ${error}`);
        if (error.response) {
            console.log('Status:', error.response.status); // Status code
            console.log('Headers:', error.response.headers); // Headers della risposta
            console.log('Data:', error.response.data); // Dati della risposta
        } else if (error.request) {
            console.log('Request data:', error.request);
        } else {
            console.log('Errore:', error.message);
        }
        console.log('Config:', error.config); // Configurazione della richiesta
        res.status(500).json({ message: 'Error sending file to Telegram' });
    }
};
