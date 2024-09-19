function setLoadingMessage(messageUp, messageDown, turnOn) {
    const loadingMessageUp = document.getElementById('loading-message-up');
    const loadingMessageDown = document.getElementById('loading-message-down');
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingMessageUp.textContent = messageUp;
    loadingMessageDown.textContent = messageDown;
    if (turnOn) loadingOverlay.style.display = 'block';
    else loadingOverlay.style.display = 'none';
}

// Funzione per gestire il download di tutti i file di una cartella
async function downloadFolder() {
    const folderName = document.getElementById('folder-name').value;
    const statusMessage = document.getElementById('status-message');
    
    if (!folderName) {
        statusMessage.textContent = "Please select a folder.";
        statusMessage.className = 'status-error';
        return;
    }

    setLoadingMessage("Started downloading", "", true);

    try {
        // Fetch the folder structure
        const response = await fetch('http://localhost:3000/api/folder');
        const data = await response.json();
        const files = data.data[folderName];

        if (!files || Object.keys(files).length === 0) {
            statusMessage.textContent = `No files found in ${folderName}.`;
            statusMessage.className = 'status-error';
            setLoadingMessage("", "", false);
            return;
        }

        // Itera su ogni file della cartella e invia la richiesta di download
        for (const fileName in files) {
            const cleanFileName = fileName.replace(/xDOTx/g, '.');
            await downloadFileFromServer(cleanFileName, folderName);
        }

        statusMessage.textContent = `Files downloaded in \"${downloadPath}\"`;
        statusMessage.className = 'status-success';
    } catch (error) {
        console.error('Error downloading folder:', error);
    } finally {
        setLoadingMessage("", "", false);
    }
}

let downloadPath = "";

// Funzione per scaricare un singolo file dal server
async function downloadFileFromServer(fileName, folderName) {
    const downloadUrl = 'http://localhost:3000/api/file/download';
    setLoadingMessage(`Downloading \"${fileName}\"`, "Check the progress into the server console", true);
    const response = await fetch(downloadUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            filename: fileName,
            folder: folderName,
        }),
    });
    if (response.ok) {
        const data = await response.json();
        let regex = new RegExp(`[\\\\\\/]+${folderName}.*`);
        downloadPath = data.downloadPath.replace(regex, '');
    } else {
        statusMessage.textContent = `Cannot download file ${fileName}`;
        statusMessage.className = 'status-error';
        console.error(`Failed to download ${fileName}`);
        throw new Error(`Cannot download file ${fileName}`);
    }
}

// Event listener per il pulsante di download
document.getElementById('download-button').addEventListener('click', downloadFolder);
